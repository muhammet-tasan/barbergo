-- barbergo MVP seed data for Basel demo.

insert into public.providers (
  id,
  name,
  description,
  service_area,
  is_active
) values (
  '11111111-1111-1111-1111-111111111111',
  'Muhammet',
  'Mobiler Barber - professionelle Haarschnitte bei dir zu Hause in Basel.',
  'Basel & Umgebung',
  true
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  service_area = excluded.service_area,
  is_active = excluded.is_active;

insert into public.services (
  id,
  provider_id,
  name,
  price_chf,
  duration_minutes,
  sort_order,
  is_active
) values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Herrenhaarschnitt',
    45,
    30,
    1,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Bart trimmen',
    25,
    20,
    2,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Haarschnitt + Bart',
    60,
    45,
    3,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222224',
    '11111111-1111-1111-1111-111111111111',
    'Kinderhaarschnitt',
    35,
    25,
    4,
    true
  )
on conflict (id) do update set
  provider_id = excluded.provider_id,
  name = excluded.name,
  price_chf = excluded.price_chf,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
