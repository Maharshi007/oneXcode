import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Bookmark,
  ExternalLink,
  Code2,
  Save,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import type { ProblemDetail } from '../types';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { TopicBadge } from '../components/common/TopicBadge';
import { useProgress } from '../context/ProgressContext';

interface ProblemDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProblemDetailPage: React.FC<ProblemDetailPageProps> = ({
  slug,
  onNavigate,
}) => {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  const {
    getStatus,
    setStatus,
    isBookmarked,
    toggleBookmark,
    getNotes,
    saveNotes,
  } = useProgress();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const data = await api.getProblem(slug);
        setProblem(data);
        setNotes(getNotes(data.id));
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug, getNotes]);

  if (loading && !problem) {
    return (
      <div className="py-12 space-y-6 animate-pulse">
        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Problem Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          Could not find problem "{slug}".
        </p>
        <button
          onClick={() => onNavigate('/problems')}
          className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold cursor-pointer"
        >
          Back to Problems
        </button>
      </div>
    );
  }

  const currentStatus = getStatus(problem.id);
  const bookmarked = isBookmarked(problem.id);

  const handleSaveNotes = () => {
    saveNotes(problem.id, notes);
  };

  return (
    <div className="space-y-8 py-4 animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/problems')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all problems</span>
      </button>

      {/* Main Problem Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <DifficultyBadge difficulty={problem.difficulty} size="lg" />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Asked by <strong>{problem.companies.length}</strong> top companies
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {problem.name}
            </h1>

            {/* Topics */}
            <div className="flex flex-wrap gap-2 pt-1">
              {problem.topics.map((t, idx) => (
                <TopicBadge
                  key={idx}
                  topic={t}
                  onClick={() => onNavigate(`/problems?topic=${encodeURIComponent(t)}`)}
                />
              ))}
            </div>
          </div>

          {/* Action buttons: Status cycle, Bookmark */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Button */}
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
              <button
                onClick={() => setStatus(problem.id, 'not_started', problem.name)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentStatus === 'not_started'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setStatus(problem.id, 'attempted', problem.name)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentStatus === 'attempted'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatus(problem.id, 'solved', problem.name)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentStatus === 'solved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100'
                }`}
              >
                Solved
              </button>
            </div>

            {/* Bookmark */}
            <button
              onClick={() => toggleBookmark(problem.id, problem.name)}
              className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600'
                  : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title={bookmarked ? 'Bookmarked' : 'Bookmark problem'}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* LeetCode practice placeholder banner */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Practice Online
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Direct LeetCode problem links will be enriched via automated data pipeline.
            </p>
          </div>

          <button
            disabled
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-not-allowed"
          >
            <span>LeetCode link coming soon</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Companies Asking this Question */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Companies That Ask This Problem ({problem.companies.length})
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
          {problem.companies.map((company) => (
            <button
              key={company.id}
              onClick={() => onNavigate(`/companies/${company.slug}`)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-brand-500/50 hover:bg-brand-50/50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 transition-all cursor-pointer"
            >
              <div className="h-5 w-5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold">
                {company.name.charAt(0)}
              </div>
              <span>{company.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personal Notes & Reflection */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Personal Solution Notes & Edge Cases
            </h2>
          </div>
          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Notes</span>
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write down your approach, time/space complexity (O(N)), key edge cases, or intuition..."
          rows={5}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
        />
      </div>

      {/* Related Problems in same topic */}
      {problem.related_problems && problem.related_problems.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Related Problems ({problem.topics[0]})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {problem.related_problems.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onNavigate(`/problems/${rel.slug}`)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 text-left transition-colors group cursor-pointer"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate block">
                    {rel.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                    {rel.topics.join(' · ')}
                  </span>
                </div>
                <DifficultyBadge difficulty={rel.difficulty} size="sm" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
