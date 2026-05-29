-- =============================================
-- SlotMD Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('patient', 'clinic')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- CLINICS
create table public.clinics (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  website text,
  specialties text[] default '{}',
  description text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.clinics enable row level security;
create policy "Clinics are publicly readable" on public.clinics for select using (active = true);
create policy "Clinic owners can update" on public.clinics for update using (auth.uid() = owner_id);
create policy "Clinic owners can insert" on public.clinics for insert with check (auth.uid() = owner_id);

-- DOCTORS
create table public.doctors (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  name text not null,
  specialty text,
  created_at timestamptz default now()
);
alter table public.doctors enable row level security;
create policy "Doctors are publicly readable" on public.doctors for select using (true);
create policy "Clinic owners can manage doctors" on public.doctors for all
  using (exists (select 1 from public.clinics c where c.id = clinic_id and c.owner_id = auth.uid()));

-- BOOKING REQUESTS
create table public.booking_requests (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users(id) on delete cascade not null,
  clinic_id uuid references public.clinics(id) on delete set null,
  specialty text not null,
  practice_preference text not null check (practice_preference in ('any', 'specific')),
  timing_preference text not null check (timing_preference in ('first', 'preferred', 'both')),
  preferred_days text[] default '{}',
  preferred_time_of_day text,
  patient_name text not null,
  patient_email text not null,
  patient_phone text not null,
  notes text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'matched', 'confirmed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent text,
  amount_paid integer default 0, -- cents
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.booking_requests enable row level security;
create policy "Patients can view own requests" on public.booking_requests for select using (auth.uid() = patient_id);
create policy "Patients can insert own requests" on public.booking_requests for insert with check (auth.uid() = patient_id);
create policy "Clinic staff can view matched requests" on public.booking_requests for select
  using (exists (select 1 from public.clinics c where c.id = clinic_id and c.owner_id = auth.uid()));
-- Service role can update (used by webhook)
create policy "Service role full access" on public.booking_requests for all using (true) with check (true);

-- APPOINTMENTS (confirmed bookings)
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  booking_request_id uuid references public.booking_requests(id) on delete cascade not null,
  clinic_id uuid references public.clinics(id) on delete set null,
  patient_id uuid references auth.users(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  confirmed_by uuid references auth.users(id),
  notes text,
  created_at timestamptz default now()
);
alter table public.appointments enable row level security;
create policy "Patients can view own appointments" on public.appointments for select using (auth.uid() = patient_id);
create policy "Clinic owners can view clinic appointments" on public.appointments for select
  using (exists (select 1 from public.clinics c where c.id = clinic_id and c.owner_id = auth.uid()));
create policy "Clinic owners can insert appointments" on public.appointments for insert
  with check (exists (select 1 from public.clinics c where c.id = clinic_id and c.owner_id = auth.uid()));
create policy "Service role full access" on public.appointments for all using (true) with check (true);

-- NOTIFICATIONS
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'booking_confirmed', 'new_request', 'appointment_scheduled', etc.
  title text not null,
  body text not null,
  read boolean default false,
  link text, -- optional deep link within app
  related_id uuid, -- booking_request_id or appointment_id
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Service role full access" on public.notifications for all using (true) with check (true);

-- UPDATED_AT trigger for booking_requests
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger booking_requests_updated_at
  before update on public.booking_requests
  for each row execute function update_updated_at();

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;
