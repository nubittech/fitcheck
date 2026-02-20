-- =============================================
-- FitCheck Voting System Migration
-- Run in Supabase SQL Editor
-- =============================================

-- 1. OUTFIT VOTES TABLE (like / dislike per outfit, 1 per user)
create table if not exists outfit_votes (
    id uuid primary key default gen_random_uuid(),
    outfit_id uuid not null references outfits(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    vote text not null check (vote in ('like', 'dislike')),
    created_at timestamptz default now(),
    unique(outfit_id, user_id)
);

-- 2. ITEM VOTES TABLE (thumbs up / thumbs down per item per user)
create table if not exists item_votes (
    id uuid primary key default gen_random_uuid(),
    outfit_id uuid not null references outfits(id) on delete cascade,
    item_index integer not null,   -- index of the item in the outfit.items array
    user_id uuid not null references profiles(id) on delete cascade,
    vote text not null check (vote in ('up', 'down')),
    created_at timestamptz default now(),
    unique(outfit_id, item_index, user_id)
);

-- 3. INDEXES
create index if not exists idx_outfit_votes_outfit on outfit_votes(outfit_id);
create index if not exists idx_item_votes_outfit on item_votes(outfit_id, item_index);

-- 4. RLS
alter table outfit_votes enable row level security;
alter table item_votes enable row level security;

-- outfit_votes: anyone can read, only authenticated can write own vote
create policy "outfit_votes_select" on outfit_votes for select using (true);
create policy "outfit_votes_insert" on outfit_votes for insert
    with check (auth.uid() = user_id);
create policy "outfit_votes_delete" on outfit_votes for delete
    using (auth.uid() = user_id);

-- item_votes: anyone can read, only authenticated can write own vote
create policy "item_votes_select" on item_votes for select using (true);
create policy "item_votes_insert" on item_votes for insert
    with check (auth.uid() = user_id);
create policy "item_votes_delete" on item_votes for delete
    using (auth.uid() = user_id);
