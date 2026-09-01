import React from 'react';
import { ChevronRight, Layers, Sparkles } from 'lucide-react';
import type { Company } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
  solvedCount?: number;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onClick,
  solvedCount = 0,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header: Initial icon & Name & Solved badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm group-hover:bg-brand-50 dark:group-hover:bg-brand-950/80 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>{company.problem_count} Problems</span>
              </div>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>

        {/* Difficulty Distribution Bar */}
        <div className="mt-5 space-y-1.5">
          <ProgressBar
            easy={company.easy_count}
            medium={company.medium_count}
            hard={company.hard_count}
            total={company.problem_count}
            size="sm"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              E: {company.easy_count}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              M: {company.medium_count}
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              H: {company.hard_count}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / User Progress if any */}
      {solvedCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Your progress
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {solvedCount} / {company.problem_count} ({Math.round((solvedCount / company.problem_count) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
};
