-- Create an enum for message roles
create type message_role as enum ('user', 'assistant');

-- Create the chat_history table
create table if not exists public.chat_history (
    id uuid default gen_random_uuid() primary key,
    session_id text not null,
    role message_role not null,
    content text not null,
    created_at timestamptz default now() not null,
    message_order integer not null
);

create policy "Allow public access to chat_history"
    on public.chat_history
    for all
    using (true)
    with check (true);

-- Function to get chat sessions with latest message info
create or replace function get_chat_sessions()
returns table (
    session_id text,
    latest_message text,
    created_at timestamptz,
    message_count bigint
) as $$
begin
    return query
    select distinct
        ch.session_id,
        first_value(ch.content) over (
            partition by ch.session_id
            order by ch.created_at desc
        ) as latest_message,
        max(ch.created_at) over (partition by ch.session_id) as created_at,
        count(*) over (partition by ch.session_id) as message_count
    from public.chat_history ch
    order by created_at desc;
end;
$$ language plpgsql security definer;
