import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { getCountdownParts } from '../utils/dates';

interface CountdownCardProps {
  target?: string;
}

export function CountdownCard({ target }: CountdownCardProps) {
  const [parts, setParts] = useState(() => getCountdownParts(target));

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(target));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return (
    <DashboardCard
      title="Race Countdown"
      eyebrow="Lights out"
      action={<Clock3 className="h-5 w-5 text-f1-red" />}
    >
      <div className="grid grid-cols-4 gap-2">
        {parts.map((part) => (
          <div key={part.label} className="rounded-lg border border-white/10 bg-black/30 p-3 text-center">
            <div className="font-mono text-2xl font-bold text-white sm:text-3xl">{part.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{part.label}</div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
