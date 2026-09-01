import React from 'react';

interface TopicBadgeProps {
  topic: string;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md';
}

export const TopicBadge: React.FC<TopicBadgeProps> = ({
  topic,
  onClick,
  selected = false,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  
  const baseClasses = `inline-flex items-center font-semibold rounded-md transition-colors ${sizeClasses}`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:border-brand-500/60 dark:hover:border-brand-400/60' : '';
  
  const stateClasses = selected
    ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-500/40 dark:border-brand-500/60 shadow-sm'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-950 dark:hover:text-slate-100';

  return (
    <span
      onClick={onClick}
      className={`${baseClasses} ${interactiveClasses} ${stateClasses}`}
    >
      {topic}
    </span>
  );
};
