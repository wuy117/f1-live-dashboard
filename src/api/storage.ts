import type { ApiResult } from '../types/f1';

const CACHE_PREFIX = 'f1-live-dashboard:cache:';

function readCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Storage can be unavailable in private browsing; the app still works.
  }
}

export async function fetchJson<T>(
  url: string,
  cacheKey: string,
  validator: (value: unknown) => value is T,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = (await response.json()) as unknown;
    if (!validator(json)) throw new Error('Unexpected response shape');
    writeCache(cacheKey, json);
    return { data: json };
  } catch {
    const cached = readCache<T>(cacheKey);
    if (cached) {
      return {
        data: cached,
        fromCache: true,
        error: 'Fresh data is unavailable, so cached data is being shown.',
      };
    }
    return { error: 'Data is temporarily unavailable.' };
  }
}
