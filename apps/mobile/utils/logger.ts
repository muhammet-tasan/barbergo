export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_PATTERN = /\b(?:\+|00)?\d[\d\s().-]{6,}\d\b/g;
const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+){2}/g;
const TOKEN_PARAM_PATTERN = /(?:access|refresh)_token[=:]\S+/gi;
const URL_PATTERN = /https?:\/\/\S+|barbergo:\/\/\S+/gi;

function resolveLogLevel(): LogLevel {
  const fromEnv = process.env.EXPO_PUBLIC_LOG_LEVEL?.trim().toLowerCase();
  if (fromEnv && fromEnv in LEVEL_RANK) {
    return fromEnv as LogLevel;
  }
  return IS_DEV ? 'debug' : 'warn';
}

const activeLevel = resolveLogLevel();

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

function formatMeta(meta?: unknown): string | undefined {
  if (meta === undefined || meta === null) return undefined;
  if (typeof meta === 'string') return redact(meta);
  if (meta instanceof Error) return classifyError(meta);
  if (typeof meta === 'object' && meta !== null && 'message' in meta) {
    const message = (meta as { message?: unknown }).message;
    if (typeof message === 'string') return redact(classifyError(message));
  }
  return redact(String(meta));
}

function shouldLog(level: LogLevel): boolean {
  if (activeLevel === 'silent') return false;
  return LEVEL_RANK[level] >= LEVEL_RANK[activeLevel];
}

function writeLog(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: unknown
): void {
  if (!shouldLog(level)) return;

  const prefix = `[barbergo:${scope}]`;
  const safeMeta = formatMeta(meta);

  if (level === 'debug' || level === 'info') {
    if (safeMeta) {
      console.log(prefix, message, safeMeta);
    } else {
      console.log(prefix, message);
    }
    return;
  }

  if (level === 'warn') {
    if (safeMeta) {
      console.warn(prefix, message, safeMeta);
    } else {
      console.warn(prefix, message);
    }
    return;
  }

  if (safeMeta) {
    console.error(prefix, message, safeMeta);
  } else {
    console.error(prefix, message);
  }
}

export type ScopedLogger = {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
};

export function createLogger(scope: string): ScopedLogger {
  return {
    debug: (message, meta) => writeLog('debug', scope, message, meta),
    info: (message, meta) => writeLog('info', scope, message, meta),
    warn: (message, meta) => writeLog('warn', scope, message, meta),
    error: (message, meta) => writeLog('error', scope, message, meta),
  };
}

/** @deprecated Prefer createLogger(scope) in new code. */
export const logger = {
  debug(scope: string, message: string, meta?: string): void {
    createLogger(scope).debug(message, meta);
  },
  warn(scope: string, message: string, codeOrErr?: string | unknown): void {
    const meta =
      typeof codeOrErr === 'string'
        ? codeOrErr
        : codeOrErr !== undefined
          ? classifyError(codeOrErr)
          : undefined;
    createLogger(scope).warn(message, meta);
  },
  error(scope: string, message: string, codeOrErr?: string | unknown): void {
    const meta =
      typeof codeOrErr === 'string'
        ? codeOrErr
        : codeOrErr !== undefined
          ? classifyError(codeOrErr)
          : undefined;
    createLogger(scope).error(message, meta);
  },
};
