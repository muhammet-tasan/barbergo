const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+|00)?\d[\d\s().-]{6,}\d\b/g;
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+){2}/g;
const TOKEN_PARAM_PATTERN = /(?:access|refresh)_token[=:]\S+/gi;
const URL_PATTERN = /https?:\/\/\S+|barbergo:\/\/\S+/gi;

function redact(value: string): string {
  return value
    .replace(EMAIL_PATTERN, '[redacted]')
    .replace(PHONE_PATTERN, '[redacted]')
    .replace(JWT_PATTERN, '[redacted]')
    .replace(TOKEN_PARAM_PATTERN, '[redacted]')
    .replace(URL_PATTERN, '[redacted]');
}

/** Maps errors/messages to safe codes — never log raw Supabase text in the app. */
export function classifyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === 'string' && code.trim()) return code;
  }

  const message = err instanceof Error ? err.message : String(err ?? 'unknown');
  const lower = message.toLowerCase();

  if (lower.includes('rate limit') || lower.includes('too many requests')) return 'rate_limit';
  if (lower.includes('row-level') || lower.includes('rls')) return 'rls_denied';
  if (lower.includes('permission denied')) return 'permission_denied';
  if (lower.includes('network') || lower.includes('fetch failed')) return 'network';
  if (lower.includes('already registered')) return 'duplicate_email';
  if (lower.includes('email not confirmed')) return 'email_not_confirmed';
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'invalid_credentials';
  }
  if (lower.includes('does not exist') || lower.includes('not found')) return 'not_found';
  if (lower.includes('duplicate')) return 'duplicate';
  if (lower.includes('timeout')) return 'timeout';

  return 'error';
}

function formatMeta(meta?: string): string | undefined {
  if (!meta) return undefined;
  return redact(meta);
}

export const logger = {
  /** Dev-only diagnostic output. Never logs in production builds. */
  debug(scope: string, message: string, meta?: string): void {
    if (!IS_DEV) return;
    const safeMeta = formatMeta(meta);
    if (safeMeta) {
      console.log(`[barbergo:${scope}]`, message, safeMeta);
      return;
    }
    console.log(`[barbergo:${scope}]`, message);
  },

  /** Non-sensitive operational warnings (dev only). */
  warn(scope: string, message: string, codeOrErr?: string | unknown): void {
    if (!IS_DEV) return;
    const code =
      typeof codeOrErr === 'string' ? codeOrErr : codeOrErr !== undefined ? classifyError(codeOrErr) : undefined;
    if (code) {
      console.warn(`[barbergo:${scope}]`, message, code);
      return;
    }
    console.warn(`[barbergo:${scope}]`, message);
  },

  /** Unexpected failures (dev only, sanitized). */
  error(scope: string, message: string, codeOrErr?: string | unknown): void {
    if (!IS_DEV) return;
    const code =
      typeof codeOrErr === 'string' ? codeOrErr : codeOrErr !== undefined ? classifyError(codeOrErr) : undefined;
    if (code) {
      console.error(`[barbergo:${scope}]`, message, code);
      return;
    }
    console.error(`[barbergo:${scope}]`, message);
  },
};
