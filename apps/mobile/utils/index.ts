/** Shared utilities — add formatters and validators as screens are built. */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
