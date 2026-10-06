-- ================================================================
-- PATCH: التحكم في عدد الأجهزة والجلسات النشطة (Device & Session Management)
-- تشغيل هذا الاسكربت في Supabase SQL Editor
-- ================================================================

-- 1. إضافة عمود الحد الأقصى للأجهزة في جدول users (الافتراضي: 1 جهاز)
alter table public.users 
add column if not exists max_devices integer default 1;

-- 2. إنشاء جدول الجلسات النشطة للأجهزة
create table if not exists public.user_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  session_token text unique not null,
  device_name text default 'جهاز غير معروف',
  user_agent text,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- فهارس للبحث السريع
create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
create index if not exists idx_user_sessions_token on public.user_sessions(session_token);

-- 3. تفعيل وحماية الـ Row Level Security (RLS)
alter table public.user_sessions enable row level security;

drop policy if exists "Allow read user_sessions" on public.user_sessions;
drop policy if exists "Allow insert user_sessions" on public.user_sessions;
drop policy if exists "Allow update user_sessions" on public.user_sessions;
drop policy if exists "Allow delete user_sessions" on public.user_sessions;

create policy "Allow read user_sessions" on public.user_sessions for select using (true);
create policy "Allow insert user_sessions" on public.user_sessions for insert with check (true);
create policy "Allow update user_sessions" on public.user_sessions for update using (true);
create policy "Allow delete user_sessions" on public.user_sessions for delete using (true);
