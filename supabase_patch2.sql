-- SQL Patch to add missing user columns
-- Run this in your Supabase SQL Editor

alter table public.users 
add column if not exists whatsapp text,
add column if not exists parent_phone text,
add column if not exists parent_whatsapp text,
add column if not exists category_id bigint references public.categories(id),
add column if not exists class_id bigint references public.classes(id),
add column if not exists discount_code text,
add column if not exists school_name text,
add column if not exists religion text,
add column if not exists gender text,
add column if not exists birth_date text,
add column if not exists notes text,
add column if not exists father_job text,
add column if not exists father_phone text;
