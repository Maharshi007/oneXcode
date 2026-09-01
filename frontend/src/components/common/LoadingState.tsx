import React from 'react';

interface LoadingStateProps {
  type?: 'card' | 'table' | 'stats' | 'page';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'table',
  count = 5,
}) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800 p-5 space-y-3">
            <div className="h-5 w-1/2 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-200/70 dark:bg-slate-800/70"
        >
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
          </div>
          <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
};
