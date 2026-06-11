import { motion } from 'framer-motion';
import { CalendarDays, CloudSun, Database, Flag, Radio } from 'lucide-react';
import type { ReactNode } from 'react';
import { getLiveSessionData } from '../api/openf1';
import { usePolling } from '../hooks/usePolling';
import type { DataConfidence, Race } from '../types/f1';
import { formatClock, formatDateTime, getCountdownParts } from '../utils/dates';
import { classNames, friendlyNumber } from '../utils/formatters';
import { DashboardCard } from './DashboardCard';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { EmptyState } from './EmptyState';

interface RaceCentreProps {
  race?: Race;
  jolpicaError?: string;
}

export function RaceCentre({ race, jolpicaError }: RaceCentreProps) {
  const { data, loading, error, lastUpdated, refresh } = usePolling(getLiveSessionData, 30_000);
  const raceConfidence: DataConfidence = jolpicaError ? 'Cached' : race ? 'Live' : 'Unavailable';
  const timingConfidence = data?.confidence ?? (loading ? 'Historical' : 'Unavailable');
  const countdown = getCountdownParts(race ? `${race.date}T${race.time ?? '00:00:00Z'}` : undefined).filter((part) => part.label !== 'Secs');
  const liveSession = race?.sessions.find((session) => session.status === 'live');
  const status = liveSession ? 'live' : race?.sessions.every((session) => session.status === 'completed') ? 'completed' : 'upcoming';

  return (
    <DashboardCard
      title="Race Centre"
      eyebrow="Grand Prix control"
      action={
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-f1-red/60 hover:bg-f1-red/15"
        >
          <Radio className="h-4 w-4" />
          Sync
        </button>
      }
    >
      {race ? (
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <DataConfidenceBadge confidence={raceConfidence} label="Jolpica calendar" />
              <DataConfidenceBadge confidence={timingConfidence} label="OpenF1 timing" />
            </div>
            <h3 className="mt-4 text-3xl font-black uppercase text-white">{race.raceName}</h3>
            <p className="mt-1 text-sm text-slate-400">{race.circuitName} · {race.country}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {countdown.map((part) => (
                <div key={part.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                  <p className="font-mono text-3xl font-black text-white">{part.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">{part.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <CentreFact icon={<Flag className="h-4 w-4" />} label="Status" value={status} tone={status === 'live' ? 'text-f1-red' : 'text-white'} />
              <CentreFact icon={<CalendarDays className="h-4 w-4" />} label="Race" value={formatDateTime(race.date, race.time)} />
              <CentreFact icon={<Database className="h-4 w-4" />} label="Updated" value={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Awaiting sync'} />
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <CloudSun className="h-4 w-4 text-sky-300" />
                Track Weather
              </div>
              {data?.weather ? (
                <div className="grid grid-cols-2 gap-3">
                  <WeatherStat label="Air" value={`${friendlyNumber(data.weather.air_temperature)} C`} />
                  <WeatherStat label="Track" value={`${friendlyNumber(data.weather.track_temperature)} C`} />
                  <WeatherStat label="Humidity" value={`${friendlyNumber(data.weather.humidity)}%`} />
                  <WeatherStat label="Wind" value={`${friendlyNumber(data.weather.wind_speed)} m/s`} />
                </div>
              ) : (
                <EmptyState title="Weather on standby" message={error ?? 'OpenF1 has not published weather for this session yet.'} />
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="mb-3 text-sm font-bold text-white">Weekend Schedule</p>
              <div className="space-y-2">
                {race.sessions.slice(0, 5).map((session) => (
                  <div key={`${session.name}-${session.date}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{session.name}</p>
                      <p className="text-xs text-slate-500">{formatClock(session.date, session.time)}</p>
                    </div>
                    <span
                      className={classNames(
                        'rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
                        session.status === 'live' && 'border-f1-red/50 bg-f1-red/15 text-red-100',
                        session.status === 'upcoming' && 'border-sky-300/30 bg-sky-300/10 text-sky-100',
                        session.status === 'completed' && 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
                      )}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="Race Centre waiting for the pit wall" message="The season calendar could not be loaded, so the next Grand Prix details are unavailable right now." />
      )}
    </DashboardCard>
  );
}

function CentreFact({ icon, label, value, tone = 'text-white' }: { icon: ReactNode; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{icon}{label}</div>
      <p className={classNames('mt-2 text-sm font-bold capitalize', tone)}>{value}</p>
    </div>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono font-bold text-white">{value}</p>
    </div>
  );
}
