-- Create notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  message text not null,
  category_id bigint references public.categories(id) on delete cascade,
  class_id bigint references public.classes(id) on delete cascade,
  target_type text default 'all'::text, -- 'all', 'category', 'class'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Allow public access (Read and Write) for simplicity in this development phase
create policy "Allow public access notifications" on public.notifications for all using (true) with check (true);

-- Create dismissed_notifications table
create table if not exists public.dismissed_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, notification_id)
);

-- Enable RLS for dismissal table
alter table public.dismissed_notifications enable row level security;
create policy "Allow public access dismissed_notifications" on public.dismissed_notifications for all using (true) with check (true);
