import type {
  ApiResult,
  LiveSessionData,
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Position,
  OpenF1Session,
  OpenF1Weather,
  RaceControlMessage,
} from '../types/f1';
import { fetchJson } from './storage';

const BASE_URL = 'https://api.openf1.org/v1';

function arrayValidator<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

async function getOpenF1Array<T>(path: string, cacheKey: string): Promise<ApiResult<T[]>> {
  return fetchJson<T[]>(`${BASE_URL}${path}`, cacheKey, arrayValidator<T>);
}

function latestByDriver<T extends { driver_number: number; date?: string; lap_number?: number }>(rows: T[]): T[] {
  const map = new Map<number, T>();
  rows.forEach((row) => {
    const current = map.get(row.driver_number);
    const currentSort = current?.date ?? String(current?.lap_number ?? 0);
    const nextSort = row.date ?? String(row.lap_number ?? 0);
    if (!current || nextSort >= currentSort) map.set(row.driver_number, row);
  });
  return [...map.values()];
}

export async function getRecentSessions(): Promise<ApiResult<OpenF1Session[]>> {
  return getOpenF1Array<OpenF1Session>('/sessions?session_key=latest', 'openf1-latest-session');
}

export async function getLatestAvailableSession(): Promise<ApiResult<OpenF1Session | undefined>> {
  const latest = await getRecentSessions();
  if (latest.data?.length) return { ...latest, data: latest.data[0] };
  const fallback = await getOpenF1Array<OpenF1Session>('/sessions?year=2025', 'openf1-2025-sessions');
  return { ...fallback, data: fallback.data?.at(-1) };
}

export async function getLiveSessionData(): Promise<ApiResult<LiveSessionData>> {
  const sessionResult = await getLatestAvailableSession();
  const session = sessionResult.data;
  if (!session) return { error: 'OpenF1 session data is temporarily unavailable.' };
  const key = session.session_key;
  const [drivers, positions, laps, intervals, weather, messages] = await Promise.all([
    getOpenF1Array<OpenF1Driver>(`/drivers?session_key=${key}`, `openf1-drivers-${key}`),
    getOpenF1Array<OpenF1Position>(`/position?session_key=${key}`, `openf1-positions-${key}`),
    getOpenF1Array<OpenF1Lap>(`/laps?session_key=${key}`, `openf1-laps-${key}`),
    getOpenF1Array<OpenF1Interval>(`/intervals?session_key=${key}`, `openf1-intervals-${key}`),
    getOpenF1Array<OpenF1Weather>(`/weather?session_key=${key}`, `openf1-weather-${key}`),
    getOpenF1Array<RaceControlMessage>(`/race_control?session_key=${key}`, `openf1-race-control-${key}`),
  ]);
  const isLiveFallback = Boolean(
    sessionResult.fromCache ||
      drivers.fromCache ||
      positions.fromCache ||
      laps.fromCache ||
      intervals.fromCache ||
      weather.fromCache ||
      messages.fromCache ||
      session.date_end < new Date().toISOString(),
  );
  const hasAnyTimingData = Boolean((positions.data?.length ?? 0) + (laps.data?.length ?? 0) + (weather.data?.length ?? 0) + (messages.data?.length ?? 0));
  const confidence = !hasAnyTimingData
    ? 'Unavailable'
    : [sessionResult, drivers, positions, laps, intervals, weather, messages].some((item) => item.fromCache)
      ? 'Cached'
      : session.date_end < new Date().toISOString()
        ? 'Historical'
        : 'Live';
  return {
    error: [sessionResult, drivers, positions, laps, intervals, weather, messages].find((item) => item.error)?.error,
    data: {
      session,
      drivers: drivers.data ?? [],
      positions: latestByDriver(positions.data ?? []).sort((a, b) => a.position - b.position),
      laps: latestByDriver(laps.data ?? []).sort((a, b) => a.driver_number - b.driver_number),
      intervals: latestByDriver(intervals.data ?? []).sort((a, b) => a.driver_number - b.driver_number),
      weather: weather.data?.at(-1),
      messages: (messages.data ?? []).slice(-8).reverse(),
      isLiveFallback,
      confidence,
      lastUpdated: new Date().toISOString(),
    },
  };
}
