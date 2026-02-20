-- =============================================
-- FitCheck Messaging System
-- Run in Supabase SQL Editor
-- =============================================

-- 1. CONVERSATIONS TABLE
create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),
    participant_1 uuid not null references profiles(id) on delete cascade,
    participant_2 uuid not null references profiles(id) on delete cascade,
    last_message text,
    last_message_at timestamptz,
    created_at timestamptz default now(),
    -- Prevent duplicate pairs
    unique(participant_1, participant_2)
);

-- 2. MESSAGES TABLE
create table if not exists messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references conversations(id) on delete cascade,
    sender_id uuid not null references profiles(id) on delete cascade,
    text text not null,
    created_at timestamptz default now()
);

-- 3. INDEXES for performance
create index if not exists idx_conversations_p1 on conversations(participant_1);
create index if not exists idx_conversations_p2 on conversations(participant_2);
create index if not exists idx_messages_conv on messages(conversation_id, created_at asc);

-- 4. RLS (Row Level Security)
alter table conversations enable row level security;
alter table messages enable row level security;

-- Conversations: users can only see their own conversations
create policy "users can view own conversations"
    on conversations for select
    using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "users can create conversations"
    on conversations for insert
    with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages: users can see messages in their conversations
create policy "users can view messages in their conversations"
    on messages for select
    using (
        exists (
            select 1 from conversations c
            where c.id = messages.conversation_id
            and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
        )
    );

create policy "users can send messages in their conversations"
    on messages for insert
    with check (
        auth.uid() = sender_id
        and exists (
            select 1 from conversations c
            where c.id = messages.conversation_id
            and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
        )
    );

-- 5. ENABLE REALTIME for messages
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
