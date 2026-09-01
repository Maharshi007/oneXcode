import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No problems found',
  description = 'Try adjusting your search query, difficulty, or topic filters.',
  onReset,
  resetText = 'Clear all filters',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-dark-800 text-slate-400 dark:text-slate-500 mb-4">
        <SearchX className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 rounded-lg border border-brand-200 dark:border-brand-800/60 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resetText}
        </button>
      )}
    </div>
  );
};
