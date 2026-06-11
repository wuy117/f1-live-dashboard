import type { ReactNode } from 'react';
import { classNames } from '../utils/formatters';

interface DashboardCardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardCard({ title, eyebrow, children, className, action }: DashboardCardProps) {
  return (
    <section className={classNames('panel p-5 transition duration-300 hover:border-white/20 hover:shadow-[0_22px_70px_rgba(0,0,0,0.36)]', className)}>
      {(title || eyebrow || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.22em] text-f1-red">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-xl font-black text-white">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
