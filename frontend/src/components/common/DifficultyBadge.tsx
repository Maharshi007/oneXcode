import React from 'react';
import { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'md',
  showDot = true,
}) => {
  const diff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

  const getStyles = () => {
    switch (diff) {
      case 'Easy':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-500/20 dark:border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-500/20 dark:border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'Hard':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-500/20 dark:border-rose-500/30',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/15',
          text: 'text-slate-700 dark:text-slate-400',
          border: 'border-slate-500/20 dark:border-slate-500/30',
          dot: 'bg-slate-500',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5 gap-1.5';
      case 'lg':
        return 'text-sm px-3 py-1.5 gap-2';
      default:
        return 'text-xs px-2.5 py-1 gap-1.5';
    }
  };

  const styles = getStyles();

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${getSizeStyles()}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {diff}
    </span>
  );
};
