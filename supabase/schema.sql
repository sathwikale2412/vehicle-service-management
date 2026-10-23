-- Vehicle Service Record Management System (VSRMS) - Supabase Schema
-- Dedicated prefix: vsrms_ to avoid collisions in the shared database.

-- 1. Logins tracking table
create table if not exists public.vsrms_logins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  email text not null default '',
  logged_at timestamptz not null default now()
);

-- 2. User Profiles
create table if not exists public.vsrms_profiles (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  updated_at timestamptz not null default now()
);

-- 3. Vehicles Table
create table if not exists public.vsrms_vehicles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  model text not null default '',
  reg_number text not null,
  fuel_type text not null default 'Diesel',
  year integer not null default 2020,
  odometer_km integer not null default 0,
  reg_date date,
  insurance_expiry date,
  puc_expiry date,
  status text not null default 'Active',
  notes text default '',
  created_at timestamptz not null default now()
);

-- 4. Service Records Table
create table if not exists public.vsrms_service_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  vehicle_id bigint references public.vsrms_vehicles on delete cascade,
  service_type text not null,
  service_date date not null default current_date,
  odometer_km integer not null default 0,
  cost numeric(12, 2) not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- 5. Expenses Table
create table if not exists public.vsrms_expenses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  vehicle_id bigint references public.vsrms_vehicles on delete set null,
  title text not null,
  category text not null default 'Service',
  expense_date date not null default current_date,
  cost numeric(12, 2) not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- 6. Reminders Table
create table if not exists public.vsrms_reminders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  vehicle_id bigint references public.vsrms_vehicles on delete set null,
  title text not null,
  reminder_type text not null default 'Service',
  due_date date not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists vsrms_logins_user_idx on public.vsrms_logins (user_id, logged_at desc);
create index if not exists vsrms_vehicles_user_idx on public.vsrms_vehicles (user_id, created_at desc);
create index if not exists vsrms_services_user_idx on public.vsrms_service_records (user_id, service_date desc);
create index if not exists vsrms_expenses_user_idx on public.vsrms_expenses (user_id, expense_date desc);
create index if not exists vsrms_reminders_user_idx on public.vsrms_reminders (user_id, due_date asc);

-- Enable Row Level Security (RLS) on all tables
alter table public.vsrms_logins enable row level security;
alter table public.vsrms_profiles enable row level security;
alter table public.vsrms_vehicles enable row level security;
alter table public.vsrms_service_records enable row level security;
alter table public.vsrms_expenses enable row level security;
alter table public.vsrms_reminders enable row level security;

-- Policies (Drop before create for idempotency)
drop policy if exists "own vsrms logins read" on public.vsrms_logins;
drop policy if exists "own vsrms logins insert" on public.vsrms_logins;
create policy "own vsrms logins read" on public.vsrms_logins for select using (auth.uid() = user_id);
create policy "own vsrms logins insert" on public.vsrms_logins for insert with check (auth.uid() = user_id);

drop policy if exists "own vsrms profiles read" on public.vsrms_profiles;
drop policy if exists "own vsrms profiles insert" on public.vsrms_profiles;
drop policy if exists "own vsrms profiles update" on public.vsrms_profiles;
create policy "own vsrms profiles read" on public.vsrms_profiles for select using (auth.uid() = user_id);
create policy "own vsrms profiles insert" on public.vsrms_profiles for insert with check (auth.uid() = user_id);
create policy "own vsrms profiles update" on public.vsrms_profiles for update using (auth.uid() = user_id);

drop policy if exists "own vsrms vehicles all" on public.vsrms_vehicles;
create policy "own vsrms vehicles all" on public.vsrms_vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own vsrms services all" on public.vsrms_service_records;
create policy "own vsrms services all" on public.vsrms_service_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own vsrms expenses all" on public.vsrms_expenses;
create policy "own vsrms expenses all" on public.vsrms_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own vsrms reminders all" on public.vsrms_reminders;
create policy "own vsrms reminders all" on public.vsrms_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
