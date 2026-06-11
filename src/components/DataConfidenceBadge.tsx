import { Circle, DatabaseZap } from 'lucide-react';
import type { DataConfidence } from '../types/f1';
import { classNames } from '../utils/formatters';

interface DataConfidenceBadgeProps {
  confidence: DataConfidence;
  label?: string;
}

export function DataConfidenceBadge({ confidence, label }: DataConfidenceBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]',
        confidence === 'Live' && 'border-f1-red/50 bg-f1-red/15 text-red-100',
        confidence === 'Cached' && 'border-amber-300/35 bg-amber-300/10 text-amber-100',
        confidence === 'Historical' && 'border-sky-300/35 bg-sky-300/10 text-sky-100',
        confidence === 'Unavailable' && 'border-slate-500/35 bg-slate-500/10 text-slate-300',
      )}
    >
      {confidence === 'Live' ? <Circle className="h-2.5 w-2.5 fill-current" /> : <DatabaseZap className="h-3.5 w-3.5" />}
      {label ?? confidence}
    </span>
  );
}
