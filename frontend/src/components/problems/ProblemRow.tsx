import React from 'react';
import { Bookmark, CheckCircle2, Circle, Clock, ExternalLink, Building2 } from 'lucide-react';
import type { Problem } from '../../types';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { TopicBadge } from '../common/TopicBadge';
import { useProgress } from '../../context/ProgressContext';

interface ProblemRowProps {
  problem: Problem;
  onNavigate: (path: string) => void;
  onTopicClick?: (topic: string) => void;
  onCompanyClick?: (companySlug: string) => void;
  showCompanyTags?: boolean;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  onNavigate,
  onTopicClick,
  onCompanyClick,
  showCompanyTags = true,
}) => {
  const { getStatus, setStatus, isBookmarked, toggleBookmark } = useProgress();
  const status = getStatus(problem.id);
  const bookmarked = isBookmarked(problem.id);

  const handleStatusCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'not_started') {
      setStatus(problem.id, 'attempted', problem.name);
    } else if (status === 'attempted') {
      setStatus(problem.id, 'solved', problem.name);
    } else {
      setStatus(problem.id, 'not_started', problem.name);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(problem.id, problem.name);
  };

  const getStatusButton = () => {
    switch (status) {
      case 'solved':
        return (
          <button
            onClick={handleStatusCycle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
            title="Solved — Click to reset"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Solved</span>
          </button>
        );
      case 'attempted':
        return (
          <button
            onClick={handleStatusCycle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="In Progress — Click to mark solved"
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Attempted</span>
          </button>
        );
      default:
        return (
          <button
            onClick={handleStatusCycle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Not Started — Click to start"
          >
            <Circle className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Start</span>
          </button>
        );
    }
  };

  return (
    <tr
      onClick={() => onNavigate(`/problems/${problem.slug}`)}
      className="group hover:bg-slate-50/90 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
    >
      {/* Status & Bookmark */}
      <td className="py-3.5 pl-4 pr-2 w-28 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {getStatusButton()}
          <button
            onClick={handleBookmark}
            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
              bookmarked
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </td>

      {/* Problem Title & Asking Companies */}
      <td className="py-3.5 px-3 min-w-[220px]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {problem.name}
            </span>
          </div>

          {/* If showCompanyTags is enabled */}
          {showCompanyTags && problem.companies && problem.companies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Asked by:
              </span>
              {problem.companies.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCompanyClick) onCompanyClick(c.slug);
                    else onNavigate(`/companies/${c.slug}`);
                  }}
                  className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
              {problem.companies.length > 3 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  +{problem.companies.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Topics */}
      <td className="py-3.5 px-3 hidden md:table-cell">
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {problem.topics.slice(0, 3).map((topic, i) => (
            <TopicBadge
              key={i}
              topic={topic}
              size="sm"
              onClick={
                onTopicClick
                  ? () => onTopicClick(topic)
                  : undefined
              }
            />
          ))}
          {problem.topics.length > 3 && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 self-center font-semibold">
              +{problem.topics.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Difficulty */}
      <td className="py-3.5 px-3 w-28 whitespace-nowrap">
        <DifficultyBadge difficulty={problem.difficulty} size="sm" />
      </td>

      {/* Action / Practice */}
      <td className="py-3.5 pr-4 pl-2 text-right w-24 whitespace-nowrap">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 cursor-not-allowed"
          title="LeetCode practice links will be enriched soon"
        >
          LeetCode
          <ExternalLink className="h-3 w-3 opacity-60" />
        </span>
      </td>
    </tr>
  );
};
