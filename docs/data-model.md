# barbergo — Data model

Domain model for MVP. Types in `apps/mobile/types/domain.ts` mirror these shapes. Supabase tables will follow the same structure when connected.

## Booking status

| Status | Meaning |
|--------|---------|
| `pending` | Customer submitted; awaiting barber confirmation |
| `confirmed` | Barber accepted the appointment |
| `completed` | Service finished |
| `cancelled` | Cancelled by customer or barber |

```typescript
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
```

## Providers (barbers)

A **provider** is a barber or mobile grooming professional. MVP uses one default provider; schema supports many later.

| Field | Type | Notes |
|-------|------|--------|
| `id` | UUID / string | Primary key |
| `name` | string | Display name |
| `description` | string | Short bio |
| `service_area` | string | e.g. `Basel & surroundings` |
| `image_url` | string? | Optional avatar (Supabase Storage later) |
| `is_active` | boolean | Hide from booking when false |
| `created_at` | timestamp | Supabase default |

**Future:** link to `auth.users` for barber login.

## Services

Bookable offerings with fixed CHF price and duration.

| Field | Type | Notes |
|-------|------|--------|
| `id` | UUID / string | Primary key |
| `provider_id` | UUID / string | FK → providers |
| `name` | string | e.g. Men's haircut |
| `price_chf` | number | Integer or decimal (e.g. 45) |
| `duration_minutes` | number | e.g. 30 |
| `sort_order` | number? | UI ordering |
| `is_active` | boolean | |

**MVP seed services (Basel):**

- Men's haircut
- Beard trim
- Haircut + beard
- Kids haircut

## Bookings

A home-visit appointment request.

| Field | Type | Notes |
|-------|------|--------|
| `id` | UUID / string | Primary key |
| `provider_id` | UUID / string | FK → providers |
| `service_id` | UUID / string | FK → services |
| `status` | BookingStatus | |
| `customer_name` | string | |
| `phone` | string | E.164 or local; validate in app |
| `address` | string | Full address for Maps deeplink |
| `appointment_date` | date | ISO date string in app |
| `appointment_time` | string | e.g. `14:30` |
| `note` | string? | Optional customer note |
| `service_price_chf` | number | Snapshot at booking time |
| `service_fee_chf` | number | MVP: 1 CHF platform fee |
| `total_chf` | number | service + fee |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Relations**

```
providers 1 ── * services
providers 1 ── * bookings
services  1 ── * bookings
```

## Supabase SQL

The executable SQL lives in [`../supabase/migrations/0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql).
Run that file in the Supabase SQL editor, then run [`../supabase/seed.sql`](../supabase/seed.sql)
for the Basel MVP provider and services.

## Supabase SQL sketch

```sql
-- Run in Supabase SQL editor after project creation (simplified MVP)

create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  service_area text not null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name text not null,
  price_chf numeric(10,2) not null,
  duration_minutes int not null,
  sort_order int default 0,
  is_active boolean default true
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id),
  service_id uuid references services(id),
  status booking_status default 'pending',
  customer_name text not null,
  phone text not null,
  address text not null,
  appointment_date date not null,
  appointment_time text not null,
  note text,
  service_price_chf numeric(10,2) not null,
  service_fee_chf numeric(10,2) default 1,
  total_chf numeric(10,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Enable RLS and policies before production. Until then, the app uses `data/mockData.ts`.
