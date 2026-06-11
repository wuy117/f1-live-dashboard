import { FlagOff } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-black/25 p-6 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-f1-red/30 bg-f1-red/10 text-f1-red">
        <FlagOff className="h-5 w-5" />
      </div>
      <p className="mt-3 font-bold text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{message}</p>
    </div>
  );
}
