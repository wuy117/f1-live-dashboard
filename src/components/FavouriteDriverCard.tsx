import { Star } from 'lucide-react';
import type { LatestRaceResults, Standing } from '../types/f1';
import { teamAccentStyle } from '../utils/teamColors';
import { DashboardCard } from './DashboardCard';

interface FavouriteDriverCardProps {
  favouriteDriverId: string;
  standings: Standing[];
  latestRace?: LatestRaceResults;
}

export function FavouriteDriverCard({ favouriteDriverId, standings, latestRace }: FavouriteDriverCardProps) {
  const standing = standings.find((item) => item.driver?.id === favouriteDriverId);
  const result = latestRace?.results.find((item) => item.driver.id === favouriteDriverId);

  return (
    <DashboardCard
      title="Favourite Driver"
      eyebrow="Garage focus"
      action={<Star className="h-5 w-5 fill-f1-red text-f1-red" />}
      className="team-accent-card"
    >
      {standing?.driver ? (
        <div className="space-y-4" style={teamAccentStyle(standing.driver.team ?? standing.constructor?.name)}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--team-color)]">{standing.driver.team ?? standing.constructor?.name}</p>
            <p className="mt-1 text-2xl font-black text-white">{standing.driver.fullName}</p>
            <p className="text-sm text-slate-400">{standing.driver.nationality}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Rank" value={`P${standing.position}`} />
            <Metric label="Points" value={standing.points.toString()} />
            <Metric label="Wins" value={(standing.wins ?? 0).toString()} />
          </div>
          {result && (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest result</p>
              <p className="mt-1 text-sm text-white">
                P{result.position} at {latestRace?.raceName} · {result.points} pts
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Choose a favourite driver to pin a personal race engineer card here.</p>
      )}
    </DashboardCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}
