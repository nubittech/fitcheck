-- ============================================
-- FITCHECK DATABASE MIGRATION
-- Run this in Supabase SQL Editor (Dashboard)
-- ============================================

-- 1. Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  username text unique,
  bio text default '',
  avatar_url text default '',
  city text default '',
  age integer,
  vibes text[] default '{}',
  is_premium boolean default false,
  boosts_used integer default 0,
  boosts_reset_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. Outfits table
create table public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  caption text default '',
  gender text default 'unisex',
  vibe text default 'Casual Minimalist',
  age_range_min integer default 18,
  age_range_max integer default 35,
  items jsonb default '[]'::jsonb,
  is_boosted boolean default false,
  boosted_at timestamptz,
  views integer default 0,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now()
);

-- 3. Outfit media table
create table public.outfit_media (
  id uuid default gen_random_uuid() primary key,
  outfit_id uuid references public.outfits(id) on delete cascade not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. Likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  outfit_id uuid references public.outfits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(outfit_id, user_id)
);

-- 5. Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  outfit_id uuid references public.outfits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- 6. Indexes
create index idx_outfits_user_id on public.outfits(user_id);
create index idx_outfits_created_at on public.outfits(created_at desc);
create index idx_outfit_media_outfit_id on public.outfit_media(outfit_id);
create index idx_likes_outfit_id on public.likes(outfit_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_comments_outfit_id on public.comments(outfit_id);

-- 7. Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. Storage bucket for media
insert into storage.buckets (id, name, public)
values ('media', 'media', true);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_media enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Profiles
create policy "Profiles viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Outfits
create policy "Outfits viewable by everyone"
  on public.outfits for select using (true);
create policy "Authenticated users can create outfits"
  on public.outfits for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits"
  on public.outfits for update using (auth.uid() = user_id);
create policy "Users can delete own outfits"
  on public.outfits for delete using (auth.uid() = user_id);

-- Outfit media
create policy "Outfit media viewable by everyone"
  on public.outfit_media for select using (true);
create policy "Users can insert media for own outfits"
  on public.outfit_media for insert
  with check (auth.uid() = (select user_id from public.outfits where id = outfit_id));

-- Likes
create policy "Likes viewable by everyone"
  on public.likes for select using (true);
create policy "Authenticated users can like"
  on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments viewable by everyone"
  on public.comments for select using (true);
create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- Storage policies
create policy "Anyone can view media"
  on storage.objects for select using (bucket_id = 'media');
create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Users can delete own media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

create or replace function public.increment_outfit_stat(outfit_id_param uuid, column_name text, amount integer default 1)
returns void as $$
begin
  execute format(
    'update public.outfits set %I = %I + $1 where id = $2',
    column_name, column_name
  ) using amount, outfit_id_param;
end;
$$ language plpgsql security definer;

-- Activate boost on a profile (checks limits, resets period if needed)
create or replace function public.activate_boost(user_id_param uuid)
returns json as $$
declare
  profile_row public.profiles%rowtype;
  is_prem boolean;
  max_boosts integer;
  period_interval interval;
begin
  select * into profile_row from public.profiles where id = user_id_param;
  if not found then
    return json_build_object('success', false, 'error', 'Profile not found');
  end if;

  is_prem := coalesce(profile_row.is_premium, false);
  if is_prem then
    max_boosts := 5;
    period_interval := interval '1 month';
  else
    max_boosts := 1;
    period_interval := interval '1 week';
  end if;

  -- Reset boosts if period has passed
  if profile_row.boosts_reset_at + period_interval < now() then
    update public.profiles
      set boosts_used = 0, boosts_reset_at = now()
      where id = user_id_param;
    profile_row.boosts_used := 0;
  end if;

  -- Check limit
  if coalesce(profile_row.boosts_used, 0) >= max_boosts then
    return json_build_object('success', false, 'error', 'No boosts remaining', 'boosts_used', profile_row.boosts_used);
  end if;

  -- Increment boosts used
  update public.profiles
    set boosts_used = coalesce(boosts_used, 0) + 1
    where id = user_id_param;

  -- Mark all user's recent outfits (last 24h) as boosted
  update public.outfits
    set is_boosted = true, boosted_at = now()
    where user_id = user_id_param
      and created_at > now() - interval '24 hours';

  return json_build_object(
    'success', true,
    'boosts_used', coalesce(profile_row.boosts_used, 0) + 1,
    'max_boosts', max_boosts
  );
end;
$$ language plpgsql security definer;
