import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Bookmark,
  Building2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import type { Company, Problem } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { useProgress } from '../context/ProgressContext';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    progressState,
    getTotalSolvedCount,
    getTotalAttemptedCount,
    resetAllProgress,
  } = useProgress();

  const [topCompanies, setTopCompanies] = useState<Company[]>([]);
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Problem[]>([]);

  const totalSolved = getTotalSolvedCount();
  const totalAttempted = getTotalAttemptedCount();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const compRes = await api.getCompanies({ limit: 12, sort: 'problems_desc' });
        setTopCompanies(compRes.items);

        // Fetch bookmarked problems if any
        const bookmarkedIds = Object.entries(progressState.problems)
          .filter(([_, p]) => p.isBookmarked)
          .map(([id]) => id);

        if (bookmarkedIds.length > 0) {
          const probRes = await api.getProblems({ limit: 100 });
          const filtered = probRes.items.filter((p) =>
            bookmarkedIds.includes(p.id.toString())
          );
          setBookmarkedProblems(filtered);
        } else {
          setBookmarkedProblems([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, [progressState]);

  return (
    <div className="space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Placement Preparation Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Monitor your DSA problem milestones, target company completion rates, and bookmarked questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetAllProgress}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Problems Solved"
          value={totalSolved}
          subtitle="Target: 150+ problems for top tech OAs"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatsCard
          title="In Progress / Attempted"
          value={totalAttempted}
          subtitle="Problems currently under practice"
          icon={Clock}
          variant="amber"
        />
        <StatsCard
          title="Bookmarked for Revision"
          value={bookmarkedProblems.length}
          subtitle="Saved tricky edge cases and patterns"
          icon={Bookmark}
          variant="brand"
        />
      </div>

      {/* Target Companies Progress Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Target Company Preparedness
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Top 12 Volume Companies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topCompanies.map((company) => {
            const solvedForComp = Math.min(
              totalSolved,
              Math.max(0, Math.floor(totalSolved * 0.4))
            );
            const pct = Math.min(
              100,
              Math.round((solvedForComp / company.problem_count) * 100)
            );

            return (
              <div
                key={company.id}
                onClick={() => onNavigate(`/companies/${company.slug}`)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {company.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {company.problem_count} Questions
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(4, pct)}%` }}
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <span>E: {company.easy_count} · M: {company.medium_count} · H: {company.hard_count}</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">{pct}% Ready</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarked Revision Queue */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Revision Queue ({bookmarkedProblems.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/problems')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Browse more problems</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {bookmarkedProblems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            No bookmarked problems yet. Click the bookmark icon on any problem to pin it here for rapid revision before interviews!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedProblems.map((prob) => (
              <button
                key={prob.id}
                onClick={() => onNavigate(`/problems/${prob.slug}`)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 text-left transition-colors group cursor-pointer"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate block">
                    {prob.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {prob.topics.join(' · ')}
                  </span>
                </div>
                <DifficultyBadge difficulty={prob.difficulty} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
