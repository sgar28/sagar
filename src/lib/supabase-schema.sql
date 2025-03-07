-- Create tables for the parking management system

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.parking_spots enable row level security;
alter table public.bookings enable row level security;
alter table public.vehicles enable row level security;

-- Create parking spots table
create table public.parking_spots (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    address text not null,
    latitude double precision not null,
    longitude double precision not null,
    price_per_hour numeric not null,
    total_spots integer not null,
    available_spots integer not null,
    features text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table public.bookings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    parking_spot_id uuid references public.parking_spots not null,
    vehicle_id uuid references public.vehicles not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    total_amount numeric not null,
    payment_status text not null,
    payment_method text not null,
    payment_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vehicles table
create table public.vehicles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    type text not null,
    number text not null,
    model text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
create policy "Users can view their own profiles"
    on public.profiles for select
    using (auth.uid() = user_id);

create policy "Users can update their own profiles"
    on public.profiles for update
    using (auth.uid() = user_id);

create policy "Anyone can view parking spots"
    on public.parking_spots for select
    to authenticated
    using (true);

create policy "Users can view their own bookings"
    on public.bookings for select
    using (auth.uid() = user_id);

create policy "Users can create their own bookings"
    on public.bookings for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own vehicles"
    on public.vehicles for select
    using (auth.uid() = user_id);

create policy "Users can create their own vehicles"
    on public.vehicles for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own vehicles"
    on public.vehicles for update
    using (auth.uid() = user_id);

create policy "Users can delete their own vehicles"
    on public.vehicles for delete
    using (auth.uid() = user_id);
