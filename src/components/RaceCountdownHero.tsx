import { CalendarClock, Flag, MapPin, Radio } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Race } from '../types/f1';
import { combineDateTime, formatDateRange, formatDateTime, getCountdownParts } from '../utils/dates';
import { classNames } from '../utils/formatters';

interface RaceCountdownHeroProps {
  race?: Race;
}

export function RaceCountdownHero({ race }: RaceCountdownHeroProps) {
  const target = race ? combineDateTime(race.date, race.time).toISOString() : undefined;
  const [parts, setParts] = useState(() => getCountdownParts(target));
  const weekendStatus = useMemo(() => getWeekendStatus(race), [race]);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(target));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  const displayParts = parts.filter((part) => part.label !== 'Secs');

  return (
    <section className="hero-panel relative isolate overflow-hidden rounded-2xl border border-white/10 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-7 lg:p-8">
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 opacity-70 lg:block">
        <div className="speed-lines h-full w-full" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span
              className={classNames(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]',
                weekendStatus === 'live' && 'border-f1-red/60 bg-f1-red/20 text-red-100',
                weekendStatus === 'upcoming' && 'border-sky-300/35 bg-sky-300/10 text-sky-100',
                weekendStatus === 'completed' && 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
              )}
            >
              <Radio className="h-3.5 w-3.5" />
              {weekendStatus}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
              Next Grand Prix
            </span>
          </div>

          <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            {race?.raceName ?? 'Grand Prix TBC'}
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <HeroFact icon={<Flag className="h-4 w-4" />} label="Circuit" value={race?.circuitName ?? 'Circuit TBC'} />
            <HeroFact icon={<MapPin className="h-4 w-4" />} label="Country" value={race?.country ?? 'Country TBC'} />
            <HeroFact icon={<CalendarClock className="h-4 w-4" />} label="Race Date" value={race ? formatDateTime(race.date, race.time) : 'Date TBC'} />
          </div>
          <p className="mt-4 inline-flex rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-slate-400">
            Race weekend: {formatDateRange(race?.sessions[0]?.date, race?.date)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/35 p-4 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-f1-red">Countdown</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {displayParts.map((part) => (
              <div key={part.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:-translate-y-0.5 hover:border-f1-red/45 hover:bg-f1-red/10">
                <p className="font-mono text-3xl font-black text-white sm:text-4xl">{part.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{part.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-f1-red">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function getWeekendStatus(race?: Race): 'upcoming' | 'live' | 'completed' {
  if (!race) return 'upcoming';
  if (race.sessions.some((session) => session.status === 'live')) return 'live';
  if (race.sessions.every((session) => session.status === 'completed')) return 'completed';
  return 'upcoming';
}
