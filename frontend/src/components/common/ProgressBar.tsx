import React from 'react';

interface ProgressBarProps {
  easy: number;
  medium: number;
  hard: number;
  total?: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  easy,
  medium,
  hard,
  total: customTotal,
  showLabels = false,
  size = 'md',
}) => {
  const total = customTotal || (easy + medium + hard) || 1;
  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full space-y-1.5">
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-800 flex ${heightClass}`}>
        {easyPct > 0 && (
          <div
            style={{ width: `${easyPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Easy: ${easy} (${easyPct}%)`}
          />
        )}
        {medPct > 0 && (
          <div
            style={{ width: `${medPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Medium: ${medium} (${medPct}%)`}
          />
        )}
        {hardPct > 0 && (
          <div
            style={{ width: `${hardPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Hard: ${hard} (${hardPct}%)`}
          />
        )}
      </div>

      {showLabels && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Easy: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{easy}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Medium: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{medium}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Hard: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{hard}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
