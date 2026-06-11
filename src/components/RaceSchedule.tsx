import { CalendarDays } from 'lucide-react';
import type { Race } from '../types/f1';
import { formatClock, formatDateTime } from '../utils/dates';
import { classNames } from '../utils/formatters';
import { DashboardCard } from './DashboardCard';

interface RaceScheduleProps {
  race?: Race;
}

export function RaceSchedule({ race }: RaceScheduleProps) {
  return (
    <DashboardCard title="Race Weekend Schedule" eyebrow="Session plan" action={<CalendarDays className="h-5 w-5 text-f1-red" />}>
      {race ? (
        <div className="space-y-3">
          {race.sessions.map((session) => (
            <div key={`${session.name}-${session.date}`} className="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-white/10 bg-black/25 p-3 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <p className="font-semibold text-white">{session.name}</p>
                <p className="text-xs text-slate-500 sm:hidden">{formatDateTime(session.date, session.time)}</p>
              </div>
              <p className="hidden text-sm text-slate-300 sm:block">{formatDateTime(session.date, session.time)}</p>
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-xs text-slate-500 sm:block">{formatClock(session.date, session.time)}</span>
                <span
                  className={classNames(
                    'rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
                    session.status === 'live' && 'border-f1-red/60 bg-f1-red/15 text-red-100',
                    session.status === 'upcoming' && 'border-sky-400/30 bg-sky-400/10 text-sky-100',
                    session.status === 'completed' && 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
                  )}
                >
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Season schedule is not available right now.</p>
      )}
    </DashboardCard>
  );
}
