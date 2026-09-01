import React from 'react';
import type { Problem } from '../../types';
import { ProblemRow } from './ProblemRow';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { ArrowUpDown } from 'lucide-react';

interface ProblemTableProps {
  problems: Problem[];
  loading: boolean;
  onNavigate: (path: string) => void;
  onTopicClick?: (topic: string) => void;
  onCompanyClick?: (companySlug: string) => void;
  showCompanyTags?: boolean;
  onResetFilters?: () => void;
  sort?: string;
  onSortChange?: (sort: string) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  loading,
  onNavigate,
  onTopicClick,
  onCompanyClick,
  showCompanyTags = true,
  onResetFilters,
  sort = 'name_asc',
  onSortChange,
}) => {
  if (loading) {
    return <LoadingState type="table" count={8} />;
  }

  if (problems.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  const toggleSort = () => {
    if (!onSortChange) return;
    onSortChange(sort === 'name_asc' ? 'name_desc' : 'name_asc');
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/75 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <th className="py-3.5 pl-4 pr-2 w-28">Status</th>
              <th className="py-3.5 px-3">
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                  title="Sort by problem name"
                >
                  <span>Problem</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3.5 px-3 hidden md:table-cell">Topics</th>
              <th className="py-3.5 px-3 w-28">Difficulty</th>
              <th className="py-3.5 pr-4 pl-2 text-right w-24">Practice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {problems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                onNavigate={onNavigate}
                onTopicClick={onTopicClick}
                onCompanyClick={onCompanyClick}
                showCompanyTags={showCompanyTags}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
