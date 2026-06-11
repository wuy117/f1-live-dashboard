import { RefreshCw, Radio, CloudSun, Flag } from 'lucide-react';
import { getLiveSessionData } from '../api/openf1';
import { usePolling } from '../hooks/usePolling';
import { formatDateTime } from '../utils/dates';
import { classNames, formatLapDuration, friendlyNumber } from '../utils/formatters';
import { teamAccentStyle } from '../utils/teamColors';
import { DashboardCard } from './DashboardCard';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSkeleton } from './LoadingSkeleton';

export function LiveSessionPanel() {
  const { data, loading, error, lastUpdated, refresh } = usePolling(getLiveSessionData, 30_000);
  const driverMap = new Map(data?.drivers.map((driver) => [driver.driver_number, driver]) ?? []);
  const lapMap = new Map(data?.laps.map((lap) => [lap.driver_number, lap]) ?? []);
  const intervalMap = new Map(data?.intervals.map((interval) => [interval.driver_number, interval]) ?? []);

  return (
    <DashboardCard
      title={data?.session?.session_name ?? 'Live Session'}
      eyebrow="OpenF1 timing"
      action={
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-f1-red/60 hover:bg-f1-red/15"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      }
      className="xl:col-span-2"
    >
      {loading && !data ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className={classNames('inline-flex items-center gap-2 rounded-full border px-3 py-1 font-bold uppercase tracking-[0.14em]', data?.isLiveFallback ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-f1-red/40 bg-f1-red/15 text-red-100')}>
              <Radio className="h-4 w-4" />
                {data?.isLiveFallback ? 'Timing fallback' : 'Timing feed active'}
              </span>
              {data?.session && <span className="font-semibold text-white">{data.session.circuit_short_name}, {data.session.country_name}</span>}
              <span className="text-slate-500">
                Last updated {new Date(data?.lastUpdated ?? lastUpdated ?? Date.now()).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">OpenF1 is checked every 30 seconds while this panel is open.</p>
          </div>

          {data?.isLiveFallback && <ErrorMessage message="Live data unavailable — showing latest available session data." />}
          <ErrorMessage message={error} />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <CloudSun className="h-4 w-4 text-sky-300" />
                Weather
              </div>
              {data?.weather ? (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Air" value={`${friendlyNumber(data.weather.air_temperature)} C`} />
                  <Metric label="Track" value={`${friendlyNumber(data.weather.track_temperature)} C`} />
                  <Metric label="Humidity" value={`${friendlyNumber(data.weather.humidity)}%`} />
                  <Metric label="Wind" value={`${friendlyNumber(data.weather.wind_speed)} m/s`} />
                </dl>
              ) : (
                <p className="text-sm text-slate-500">Weather feed unavailable for this session.</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-4 lg:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Flag className="h-4 w-4 text-f1-red" />
                Race Control
              </div>
              {data?.messages.length ? (
                <div className="max-h-48 space-y-2 overflow-auto pr-1">
                  {data.messages.map((message) => (
                    <div key={`${message.date}-${message.message}`} className="rounded-md bg-white/[0.04] px-3 py-2 text-sm">
                      <p className="text-white">{message.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{message.category ?? message.flag ?? 'Message'} · {new Date(message.date).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No race control messages available.</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 bg-[#111119]/95 backdrop-blur">
                <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="border-b border-white/10 px-3 py-3">Pos</th>
                  <th className="border-b border-white/10 px-3 py-3">Driver</th>
                  <th className="border-b border-white/10 px-3 py-3">Team</th>
                  <th className="border-b border-white/10 px-3 py-3 text-right">Last Lap</th>
                  <th className="border-b border-white/10 px-3 py-3 text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                {(data?.positions ?? []).slice(0, 20).map((position) => {
                  const driver = driverMap.get(position.driver_number);
                  const lap = lapMap.get(position.driver_number);
                  const interval = intervalMap.get(position.driver_number);
                  return (
                    <tr key={position.driver_number} className="transition hover:bg-white/[0.04]" style={teamAccentStyle(driver?.team_name)}>
                      <td className="border-b border-white/5 px-3 py-3 font-mono text-slate-300">
                        <span className="mr-2 inline-block h-6 w-1 rounded-full bg-[var(--team-color)] align-middle" />
                        P{position.position}
                      </td>
                      <td className="border-b border-white/5 px-3 py-3 font-semibold text-white">
                        {driver?.broadcast_name ?? `#${position.driver_number}`}
                      </td>
                      <td className="border-b border-white/5 px-3 py-3 text-slate-300">{driver?.team_name ?? 'Unknown'}</td>
                      <td className="border-b border-white/5 px-3 py-3 text-right font-mono text-slate-300">{formatLapDuration(lap?.lap_duration)}</td>
                      <td className="border-b border-white/5 px-3 py-3 text-right font-mono text-slate-300">{interval?.gap_to_leader ?? interval?.interval ?? '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!data?.positions.length && <p className="py-8 text-center text-sm text-slate-500">Driver positions are not available for this session.</p>}
          </div>

          {data?.session && (
            <p className="text-xs text-slate-500">
              Session window: {formatDateTime(data.session.date_start.slice(0, 10), data.session.date_start.slice(11, 19))} to{' '}
              {formatDateTime(data.session.date_end.slice(0, 10), data.session.date_end.slice(11, 19))}
            </p>
          )}
        </div>
      )}
    </DashboardCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-mono text-white">{value}</dd>
    </div>
  );
}
