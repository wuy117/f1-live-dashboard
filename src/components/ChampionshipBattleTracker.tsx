import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import type { Standing } from '../types/f1';
import { teamAccentStyle } from '../utils/teamColors';
import { DashboardCard } from './DashboardCard';
import { EmptyState } from './EmptyState';

interface ChampionshipBattleTrackerProps {
  standings: Standing[];
  favouriteDriverId: string;
}

export function ChampionshipBattleTracker({ standings, favouriteDriverId }: ChampionshipBattleTrackerProps) {
  const drivers = standings.filter((item) => item.driver);
  const leader = drivers[0];
  const second = drivers[1];
  const favouriteIndex = drivers.findIndex((item) => item.driver?.id === favouriteDriverId);
  const favourite = favouriteIndex >= 0 ? drivers[favouriteIndex] : undefined;
  const ahead = favouriteIndex > 0 ? drivers[favouriteIndex - 1] : undefined;
  const behind = favouriteIndex >= 0 ? drivers[favouriteIndex + 1] : undefined;

  return (
    <DashboardCard title="Championship Battle" eyebrow="Points gaps" action={<Swords className="h-5 w-5 text-f1-red" />}>
      {leader && second ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <BattleCard title="Title Fight" primary={leader} secondary={second} gap={leader.points - second.points} />
          {favourite ? (
            <>
              <BattleCard title="Favourite Chase" primary={ahead ?? favourite} secondary={favourite} gap={ahead ? ahead.points - favourite.points : 0} />
              <BattleCard title="Rear View" primary={favourite} secondary={behind ?? favourite} gap={behind ? favourite.points - behind.points : 0} />
            </>
          ) : (
            <div className="lg:col-span-2">
              <EmptyState title="Choose your driver" message="Pick a favourite driver to track the gaps to the cars ahead and behind." />
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="Battle data not on the timing screen" message="Championship standings are not available right now." />
      )}
    </DashboardCard>
  );
}

function BattleCard({ title, primary, secondary, gap }: { title: string; primary: Standing; secondary: Standing; gap: number }) {
  const max = Math.max(primary.points, secondary.points, 1);
  const primaryWidth = Math.max(8, (primary.points / max) * 100);
  const secondaryWidth = Math.max(8, (secondary.points / max) * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-4">
        <BattleRow standing={primary} width={primaryWidth} />
        <BattleRow standing={secondary} width={secondaryWidth} />
      </div>
      <p className="mt-4 font-mono text-2xl font-black text-white">{gap} pts</p>
      <p className="break-words text-xs text-slate-500 [overflow-wrap:anywhere]">Gap between {primary.driver?.familyName} and {secondary.driver?.familyName}</p>
    </div>
  );
}

function BattleRow({ standing, width }: { standing: Standing; width: number }) {
  const team = standing.driver?.team ?? standing.constructor?.name;
  return (
    <div style={teamAccentStyle(team)}>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-white">P{standing.position} · {standing.driver?.fullName}</span>
        <span className="shrink-0 font-mono text-slate-300">{standing.points}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-[var(--team-color)]"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
