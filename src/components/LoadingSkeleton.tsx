import { classNames } from '../utils/formatters';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
  card?: boolean;
}

export function LoadingSkeleton({ rows = 3, className, card = false }: LoadingSkeletonProps) {
  return (
    <div className={classNames(card && 'panel p-5', 'space-y-3', className)}>
      <div className="h-3 w-28 animate-pulse rounded-full bg-f1-red/30" />
      <div className="h-7 w-2/3 animate-pulse rounded-lg bg-white/10" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04]" />
      ))}
    </div>
  );
}
