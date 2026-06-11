import { useCallback, useEffect, useRef, useState } from 'react';

interface PollingState<T> {
  data?: T;
  loading: boolean;
  error?: string;
  lastUpdated?: string;
  refresh: () => Promise<void>;
}

export function usePolling<T>(fetcher: () => Promise<{ data?: T; error?: string }>, intervalMs: number): PollingState<T> {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const inFlight = useRef(false);
  const hasData = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading((current) => current || !hasData.current);
    try {
      const result = await fetcher();
      if (result.data) {
        setData(result.data);
        hasData.current = true;
        setLastUpdated(new Date().toISOString());
      }
      setError(result.error);
    } catch {
      setError('Live timing data is temporarily unavailable.');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await refresh();
    })();
    const interval = window.setInterval(() => {
      if (!cancelled) void refresh();
    }, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [intervalMs, refresh]);

  return { data, loading, error, lastUpdated, refresh };
}
