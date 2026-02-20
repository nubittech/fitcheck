-- ============================================
-- BOOST SYSTEM MIGRATION (run after initial migration)
-- ============================================

-- Add boost tracking to profiles
alter table public.profiles add column if not exists boosts_used integer default 0;
alter table public.profiles add column if not exists boosts_reset_at timestamptz default now();

-- Add boost timestamp to outfits
alter table public.outfits add column if not exists boosted_at timestamptz;

-- Activate boost RPC function
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
