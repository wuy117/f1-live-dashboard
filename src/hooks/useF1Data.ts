import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboardData } from '../api/jolpica';
import type { F1DashboardData } from '../types/f1';

interface F1DataState {
  data?: F1DashboardData;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

export function useF1Data(): F1DataState {
  const [data, setData] = useState<F1DashboardData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    const response = await getDashboardData();
    if (response.data) setData(response.data);
    setError(response.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}
