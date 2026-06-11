import { Search, Star } from 'lucide-react';
import type { Standing } from '../types/f1';
import { classNames } from '../utils/formatters';
import { teamAccentStyle } from '../utils/teamColors';
import { DashboardCard } from './DashboardCard';

interface StandingsTableProps {
  type: 'drivers' | 'constructors';
  standings: Standing[];
  favouriteDriverId?: string;
  search?: string;
  teamFilter?: string;
  onSearchChange?: (value: string) => void;
  onTeamFilterChange?: (value: string) => void;
  onFavouriteChange?: (driverId: string) => void;
}

export function StandingsTable({
  type,
  standings,
  favouriteDriverId,
  search = '',
  teamFilter = 'All teams',
  onSearchChange,
  onTeamFilterChange,
  onFavouriteChange,
}: StandingsTableProps) {
  const teams = ['All teams', ...Array.from(new Set(standings.map((item) => item.driver?.team ?? item.constructor?.name).filter(Boolean) as string[]))];
  const filtered = standings.filter((item) => {
    const driverMatch = item.driver?.fullName.toLowerCase().includes(search.toLowerCase()) ?? true;
    const team = item.driver?.team ?? item.constructor?.name;
    const teamMatch = teamFilter === 'All teams' || team === teamFilter;
    return driverMatch && teamMatch;
  });

  return (
    <DashboardCard
      title={type === 'drivers' ? 'Driver Standings' : 'Constructor Standings'}
      eyebrow="Championship"
      action={
        type === 'drivers' ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => onSearchChange?.(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-black/35 pl-9 pr-3 text-sm text-white outline-none ring-f1-red/30 transition focus:border-f1-red focus:ring-4 sm:w-48"
                placeholder="Search driver"
              />
            </label>
            <select
              value={teamFilter}
              onChange={(event) => onTeamFilterChange?.(event.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black/35 px-3 text-sm text-white outline-none ring-f1-red/30 transition focus:border-f1-red focus:ring-4"
            >
              {teams.map((team) => (
                <option key={team}>{team}</option>
              ))}
            </select>
          </div>
        ) : undefined
      }
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-[#111119]/95 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <th className="border-b border-white/10 px-3 py-3">Pos</th>
              <th className="border-b border-white/10 px-3 py-3">{type === 'drivers' ? 'Driver' : 'Constructor'}</th>
              <th className="border-b border-white/10 px-3 py-3">Nationality</th>
              {type === 'drivers' && <th className="border-b border-white/10 px-3 py-3">Team</th>}
              <th className="border-b border-white/10 px-3 py-3 text-right">Wins</th>
              <th className="border-b border-white/10 px-3 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isFavourite = Boolean(item.driver && item.driver.id === favouriteDriverId);
              const team = item.driver?.team ?? item.constructor?.name;
              return (
                <tr
                  key={`${type}-${item.position}-${item.driver?.id ?? item.constructor?.id}`}
                  className={classNames('group transition hover:bg-white/[0.04]', isFavourite && 'bg-f1-red/10')}
                  style={teamAccentStyle(team)}
                >
                  <td className="border-b border-white/5 px-3 py-3 font-mono text-slate-300">
                    <span className="mr-2 inline-block h-7 w-1 rounded-full bg-[var(--team-color)] align-middle" />
                    P{item.position}
                  </td>
                  <td className="border-b border-white/5 px-3 py-3">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      {type === 'drivers' && (
                        <button
                          type="button"
                          title="Set favourite driver"
                          onClick={() => item.driver && onFavouriteChange?.(item.driver.id)}
                          className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-f1-red"
                        >
                          <Star className={classNames('h-4 w-4', isFavourite && 'fill-f1-red text-f1-red')} />
                        </button>
                      )}
                      {item.driver?.fullName ?? item.constructor?.name}
                    </div>
                  </td>
                  <td className="border-b border-white/5 px-3 py-3 text-slate-300">{item.driver?.nationality ?? item.constructor?.nationality}</td>
                  {type === 'drivers' && <td className="border-b border-white/5 px-3 py-3 text-slate-300">{item.driver?.team ?? item.constructor?.name}</td>}
                  <td className="border-b border-white/5 px-3 py-3 text-right font-mono text-slate-300">{item.wins ?? 0}</td>
                  <td className="border-b border-white/5 px-3 py-3 text-right font-mono font-bold text-white">{item.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {filtered.map((item) => {
          const isFavourite = Boolean(item.driver && item.driver.id === favouriteDriverId);
          const team = item.driver?.team ?? item.constructor?.name;
          return (
            <div
              key={`mobile-${type}-${item.position}-${item.driver?.id ?? item.constructor?.id}`}
              className={classNames('team-accent-card rounded-xl border border-white/10 bg-black/25 p-4', isFavourite && 'bg-f1-red/10')}
              style={teamAccentStyle(team)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-[var(--team-color)]">P{item.position}</p>
                  <p className="mt-1 truncate text-lg font-black text-white">{item.driver?.fullName ?? item.constructor?.name}</p>
                  <p className="truncate text-sm text-slate-400">{team ?? item.driver?.nationality ?? item.constructor?.nationality}</p>
                </div>
                {type === 'drivers' && (
                  <button
                    type="button"
                    title="Set favourite driver"
                    onClick={() => item.driver && onFavouriteChange?.(item.driver.id)}
                    className="rounded-md p-2 text-slate-500 transition hover:bg-white/10 hover:text-f1-red"
                  >
                    <Star className={classNames('h-4 w-4', isFavourite && 'fill-f1-red text-f1-red')} />
                  </button>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Nationality" value={item.driver?.nationality ?? item.constructor?.nationality ?? '--'} />
                <MiniStat label="Wins" value={String(item.wins ?? 0)} />
                <MiniStat label="Points" value={String(item.points)} />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-bold text-white">{value}</p>
    </div>
  );
}
