import type { Href, Router } from 'expo-router';

/** Back with fallback when the stack has no history (common on web / deep links). */
export function navigateBack(router: Router, fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
