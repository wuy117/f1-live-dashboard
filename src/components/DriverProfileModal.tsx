import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LatestRaceResults, Standing } from '../types/f1';
import { teamAccentStyle } from '../utils/teamColors';

interface DriverProfileModalProps {
  driverId?: string;
  standings: Standing[];
  latestRace?: LatestRaceResults;
  onClose: () => void;
}

export function DriverProfileModal({ driverId, standings, latestRace, onClose }: DriverProfileModalProps) {
  const standing = standings.find((item) => item.driver?.id === driverId);
  const result = latestRace?.results.find((item) => item.driver.id === driverId);
  const team = standing?.driver?.team ?? standing?.constructor?.name ?? result?.constructor.name;

  return (
    <AnimatePresence>
      {driverId && standing?.driver && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            className="team-accent-card w-full max-w-xl rounded-2xl border border-white/10 bg-[#101018] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
            style={teamAccentStyle(team)}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--team-color)]">{team}</p>
                <h2 className="mt-1 text-3xl font-black text-white">{standing.driver.fullName}</h2>
                <p className="mt-1 text-sm text-slate-400">{standing.driver.nationality}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-f1-red/50 hover:text-white"
                title="Close profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ProfileStat label="Championship" value={`P${standing.position}`} />
              <ProfileStat label="Points" value={String(standing.points)} />
              <ProfileStat label="Wins" value={String(standing.wins ?? 0)} />
              <ProfileStat label="Latest Race" value={result ? `P${result.position}` : '--'} />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Race note</p>
              <p className="mt-2 text-sm text-slate-300">
                {result
                  ? `${standing.driver.fullName} finished ${result.timeOrStatus} at ${latestRace?.raceName}, scoring ${result.points} points.`
                  : 'No latest-race result is available for this driver yet.'}
              </p>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-black text-white">{value}</p>
    </div>
  );
}
