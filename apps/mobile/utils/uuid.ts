/** Standard 8-4-4-4-12 UUID shape (accepts seed IDs like 11111111-1111-1111-1111-111111111111). */
const UUID_SHAPE_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MOCK_CATALOG_ID_RE = /^(provider|service|booking)(-|$)/i;

/** True for Supabase/Postgres UUID primary keys. */
export function isValidUuid(value: string): boolean {
  return UUID_SHAPE_RE.test(value.trim());
}

/** True for in-app demo ids (provider-1, service-2, booking-demo-1, …). */
export function isMockCatalogId(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (isValidUuid(v)) return false;
  return MOCK_CATALOG_ID_RE.test(v);
}
