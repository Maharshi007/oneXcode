import React, { useEffect, useState } from 'react';
import {
  Code2,
  Sparkles,
  Shuffle,
  RotateCcw,
  Loader2,
  Dices,
} from 'lucide-react';
import { api } from '../services/api';
import type { Problem, Company, TopicStat, PrepSetResponse } from '../types';
import { ProblemTable } from '../components/problems/ProblemTable';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';

interface ProblemsPageProps {
  onNavigate: (path: string) => void;
  searchParams: URLSearchParams;
  onUpdateParams: (params: Record<string, string>) => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({
  onNavigate,
  searchParams,
  onUpdateParams,
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Random Problem Generator State
  const [randomCount, setRandomCount] = useState<number>(5);
  const [generatingRandom, setGeneratingRandom] = useState(false);
  const [randomError, setRandomError] = useState<string | null>(null);
  const [activeRandomSet, setActiveRandomSet] = useState<PrepSetResponse | null>(null);

  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') || 'All';
  const topic = searchParams.get('topic') || 'All';
  const company = searchParams.get('company') || 'All';
  const sort = searchParams.get('sort') || 'name_asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // Load companies and topics for filter dropdowns
  useEffect(() => {
    const fetchFilterMeta = async () => {
      try {
        const [compRes, topRes] = await Promise.all([
          api.getCompanies({ limit: 100 }),
          api.getTopics(),
        ]);
        setCompanies(compRes.items);
        setTopics(topRes);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchFilterMeta();
  }, []);

  // Fetch problems on filter changes (when not in active random set)
  useEffect(() => {
    if (activeRandomSet) return;

    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await api.getProblems({
          search: search || undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          topic: topic !== 'All' ? topic : undefined,
          company: company !== 'All' ? company : undefined,
          sort,
          page,
          limit,
        });
        setProblems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [search, difficulty, topic, company, sort, page, activeRandomSet]);

  const handleSearchChange = (newSearch: string) => {
    setActiveRandomSet(null);
    onUpdateParams({ search: newSearch, page: '1' });
  };

  const handleDifficultyChange = (newDiff: string) => {
    setActiveRandomSet(null);
    onUpdateParams({ difficulty: newDiff, page: '1' });
  };

  const handleTopicChange = (newTopic: string) => {
    setActiveRandomSet(null);
    onUpdateParams({ topic: newTopic, page: '1' });
  };

  const handleCompanyChange = (newComp: string) => {
    setActiveRandomSet(null);
    onUpdateParams({ company: newComp, page: '1' });
  };

  const handleSortChange = (newSort: string) => {
    onUpdateParams({ sort: newSort, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    onUpdateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setActiveRandomSet(null);
    onUpdateParams({ search: '', difficulty: 'All', topic: 'All', company: 'All', page: '1' });
  };

  const handleGenerateRandom = async () => {
    if (randomCount < 1 || randomCount > 10) {
      setRandomError('Please select between 1 and 10 problems.');
      return;
    }

    setGeneratingRandom(true);
    setRandomError(null);

    try {
      const res = await api.getPreparationSet({
        company: company !== 'All' ? company : undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        topic: topic !== 'All' ? topic : undefined,
        count: randomCount,
        randomize: true,
      });

      if (res.problems.length === 0) {
        setRandomError('No problems found matching the selected filters.');
      } else {
        setActiveRandomSet(res);
        setProblems(res.problems);
        setTotal(res.total_selected);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to generate random problems:', err);
      let msg = 'Failed to generate random problems.';
      if (typeof err === 'string') {
        msg = err;
      } else if (typeof err?.message === 'string') {
        msg = err.message;
      } else if (typeof err?.detail === 'string') {
        msg = err.detail;
      }
      setRandomError(msg);
    } finally {
      setGeneratingRandom(false);
    }
  };

  const handleExitRandomSprint = () => {
    setActiveRandomSet(null);
  };

  return (
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              All DSA Problems
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Master {total.toLocaleString()} deduplicated problems across all top tech companies.
          </p>
        </div>

        {/* Global Problem Search */}
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by problem name or topic..."
          className="w-full md:w-80"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-brand-500 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Target Company
          </label>
          <select
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-brand-500 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="All">All Companies (210)</option>
            {companies.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.problem_count})
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Topic / Category
          </label>
          <select
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-brand-500 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="All">All Topics</option>
            {topics.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Random Problem Generator Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 shrink-0">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Random Problem Generator
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded border border-brand-200/60 dark:border-brand-800/60">
                  Sprint
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Generate 1–10 random DSA questions matching your current filters
              </p>
            </div>
          </div>

          {/* Stepper Count & Generate Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Number Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Number of problems:
              </span>
              <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setRandomCount((prev) => Math.max(1, prev - 1))}
                  disabled={randomCount <= 1 || generatingRandom}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-sm cursor-pointer"
                  aria-label="Decrease problem count"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={randomCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setRandomCount(Math.min(10, Math.max(1, val)));
                  }}
                  className="w-10 text-center bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Target number of problems"
                />
                <button
                  type="button"
                  onClick={() => setRandomCount((prev) => Math.min(10, prev + 1))}
                  disabled={randomCount >= 10 || generatingRandom}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-sm cursor-pointer"
                  aria-label="Increase problem count"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {[1, 3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRandomCount(num)}
                  disabled={generatingRandom}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    randomCount === num
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateRandom}
              disabled={generatingRandom}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {generatingRandom ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Generate Random Problems</span>
                </>
              )}
            </button>
          </div>
        </div>

        {randomError && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
            {randomError}
          </p>
        )}
      </div>

      {/* Active Random Set Alert Banner */}
      {activeRandomSet && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-brand-500/15 via-indigo-500/10 to-transparent border border-brand-500/30 text-brand-900 dark:text-brand-100 animate-slide-in">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">{activeRandomSet.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Targeting: {activeRandomSet.difficulty_filter || 'All Difficulties'}
                {company !== 'All' && ` · ${companies.find((c) => c.slug === company)?.name || company}`}
                {topic !== 'All' && ` · ${topic}`}
                {' · '}{activeRandomSet.total_selected} focused problem{activeRandomSet.total_selected !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerateRandom}
              disabled={generatingRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 shadow-xs transition-all cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Generate Again</span>
            </button>
            <button
              type="button"
              onClick={handleExitRandomSprint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Exit Sprint</span>
            </button>
          </div>
        </div>
      )}

      {/* Problem Table */}
      <ProblemTable
        problems={problems}
        loading={loading}
        onNavigate={onNavigate}
        onTopicClick={(t) => handleTopicChange(t)}
        onCompanyClick={(cSlug) => onNavigate(`/companies/${cSlug}`)}
        showCompanyTags={true}
        onResetFilters={handleReset}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {/* Pagination (only visible when not in an active random sprint) */}
      {!activeRandomSet && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

