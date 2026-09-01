import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'brand' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'slate',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'brand':
        return {
          iconBg: 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400',
          border: 'hover:border-brand-500/30',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          border: 'hover:border-emerald-500/30',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
          border: 'hover:border-amber-500/30',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
          border: 'hover:border-rose-500/30',
        };
      default:
        return {
          iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          border: 'hover:border-slate-300 dark:hover:border-slate-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
