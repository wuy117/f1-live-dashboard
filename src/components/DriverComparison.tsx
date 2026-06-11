import { ArrowRightLeft, Gauge } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { LatestRaceResults, Standing } from '../types/f1';
import { classNames } from '../utils/formatters';
import { teamAccentStyle } from '../utils/teamColors';
import { DashboardCard } from './DashboardCard';

interface DriverComparisonProps {
  standings: Standing[];
  latestRace?: LatestRaceResults;
  firstDriverId: string;
  secondDriverId: string;
  onFirstDriverChange: (driverId: string) => void;
  onSecondDriverChange: (driverId: string) => void;
}

export function DriverComparison({
  standings,
  latestRace,
  firstDriverId,
  secondDriverId,
  onFirstDriverChange,
  onSecondDriverChange,
}: DriverComparisonProps) {
  const driverRows = standings.filter((item) => item.driver);

  useEffect(() => {
    if (!driverRows.length) return;
    if (!firstDriverId) onFirstDriverChange(driverRows[0]?.driver?.id ?? '');
    if (!secondDriverId) onSecondDriverChange(driverRows[1]?.driver?.id ?? driverRows[0]?.driver?.id ?? '');
  }, [driverRows, firstDriverId, secondDriverId, onFirstDriverChange, onSecondDriverChange]);

  const first = driverRows.find((item) => item.driver?.id === firstDriverId) ?? driverRows[0];
  const second = driverRows.find((item) => item.driver?.id === secondDriverId) ?? driverRows[1] ?? driverRows[0];
  const pointsGap = Math.abs((first?.points ?? 0) - (second?.points ?? 0));
  const leader = (first?.points ?? 0) === (second?.points ?? 0) ? 'Level' : (first?.points ?? 0) > (second?.points ?? 0) ? first?.driver?.fullName : second?.driver?.fullName;

  const options = useMemo(
    () =>
      driverRows.map((item) => ({
        id: item.driver?.id ?? '',
        label: item.driver?.fullName ?? 'Driver',
      })),
    [driverRows],
  );

  return (
    <DashboardCard
      title="Driver Comparison"
      eyebrow="Head to head"
      action={<ArrowRightLeft className="h-5 w-5 text-f1-red" />}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <DriverSelect label="Driver A" value={first?.driver?.id ?? ''} options={options} onChange={onFirstDriverChange} />
        <div className="hidden place-items-center lg:grid">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-f1-red/40 bg-f1-red/15 text-f1-red">
            <Gauge className="h-6 w-6" />
          </div>
        </div>
        <DriverSelect label="Driver B" value={second?.driver?.id ?? ''} options={options} onChange={onSecondDriverChange} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(140px,180px)_minmax(0,1fr)]">
        <ComparisonCard standing={first} latestRace={latestRace} align="left" />
        <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Points gap</p>
          <p className="mt-2 font-mono text-4xl font-black text-white">{pointsGap}</p>
          <p className="mt-2 overflow-hidden text-ellipsis text-sm text-slate-400">{leader === 'Level' ? 'Drivers are level' : `${leader} ahead`}</p>
        </div>
        <ComparisonCard standing={second} latestRace={latestRace} align="right" />
      </div>
    </DashboardCard>
  );
}

function DriverSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white outline-none ring-f1-red/30 transition focus:border-f1-red focus:ring-4"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparisonCard({ standing, latestRace, align }: { standing?: Standing; latestRace?: LatestRaceResults; align: 'left' | 'right' }) {
  const driver = standing?.driver;
  const team = driver?.team ?? standing?.constructor?.name;
  const result = latestRace?.results.find((item) => item.driver.id === driver?.id);

  return (
    <div
      className={classNames(
        'team-accent-card min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-4',
        align === 'right' && 'lg:text-right',
      )}
      style={teamAccentStyle(team)}
    >
      <p className="max-w-full overflow-hidden text-ellipsis text-xs font-bold uppercase tracking-[0.12em] text-[var(--team-color)]">{team ?? 'Team TBC'}</p>
      <h3 className="mt-2 overflow-hidden text-ellipsis text-2xl font-black text-white">{driver?.fullName ?? 'Driver TBC'}</h3>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Pos" value={standing ? `P${standing.position}` : '--'} />
        <Stat label="Points" value={String(standing?.points ?? '--')} />
        <Stat label="Wins" value={String(standing?.wins ?? 0)} />
        <Stat label="Latest" value={result ? `P${result.position}` : '--'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="max-w-full overflow-hidden text-ellipsis text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-1 overflow-hidden text-ellipsis font-mono text-lg font-bold text-white">{value}</p>
    </div>
  );
}
