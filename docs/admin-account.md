# Admin-Konto (Supabase)

Die App und RLS nutzen **`public.profiles.role`** als sichere Rollenquelle — nicht `user_metadata` oder `app_metadata`.

## Bestehenden Auth-User verknüpfen

Wenn der Admin-User bereits in **Authentication → Users** existiert (z. B. `admin@barbergo.ch`), **keinen zweiten User anlegen**.

1. Migrationen `0001` → `seed` → `0003` → `0004` → **`0005_profiles_phone_admin_seed.sql`** im SQL Editor ausführen.
2. `0005` legt nur die Zeile in `public.profiles` an bzw. aktualisiert sie — per Lookup über `auth.users.email`.

Prüfen:

```sql
select u.id, u.email, p.role, p.display_name, p.phone
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('admin@barbergo.ch');
```

Erwartung: `role = admin`, `display_name` und `phone` gesetzt.

## Anzeigename und Telefon später ändern

**Quelle der Wahrheit:** `public.profiles` (nicht User Metadata in der Auth-UI).

Im Supabase **SQL Editor**:

```sql
update public.profiles
set
  display_name = 'Muhammet',
  phone = '+41 79 123 45 67'
where id = (
  select id from auth.users where lower(email) = lower('admin@barbergo.ch')
);
```

Oder mit bekannter User-UUID:

```sql
update public.profiles
set display_name = 'Muhammet', phone = '+41 79 123 45 67'
where id = 'DEINE-AUTH-USER-UUID';
```

Nach dem Update: in der App **abmelden und erneut anmelden** (oder kurz warten, bis das Profil neu geladen wird).

## Rollen

| `profiles.role` | App-Verhalten | RLS Buchungen |
|-----------------|---------------|---------------|
| `admin` | Zugriff auf `/admin`, Buchungen verwalten | Lesen + Status ändern |
| `barber` | wie `admin` für MVP | Lesen + Status ändern |
| `customer` | Meine Termine, keine Admin-Liste | Nur eigene Buchungen |

Neuen Barber ohne Admin-Rechte: `role = 'barber'` setzen. Nur Plattform-Admin: `role = 'admin'`.

## App-Konfiguration

- `EXPO_PUBLIC_ADMIN_AUTH_REQUIRED=true` in `apps/mobile/.env`
- Login unter `/login` mit `admin@barbergo.ch`
- Nach Login leitet die App anhand von `profiles.role` nach `/admin` (Staff) oder `/customer/bookings` (Kunde)

## Fehlerbehebung

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| Login ok, aber Redirect zur Startseite | Kein Profil oder `role = customer` | `0005` ausführen oder `role` auf `admin`/`barber` setzen |
| Admin-Liste leer | `0003`/`0004` fehlen | Migrationen in Reihenfolge anwenden |
| Alter Name in der App | Cache / altes Metadata | `profiles.display_name` updaten, neu anmelden |
