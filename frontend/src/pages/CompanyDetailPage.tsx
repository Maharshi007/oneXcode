import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Target,
  Sparkles,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import type { CompanyDetail, Problem, TopicStat, PrepSetResponse } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { ProblemTable } from '../components/problems/ProblemTable';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { PreparationModeModal } from '../components/problems/PreparationModeModal';

interface CompanyDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  searchParams: URLSearchParams;
  onUpdateParams: (params: Record<string, string>) => void;
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({
  slug,
  onNavigate,
  searchParams,
  onUpdateParams,
}) => {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allTopics, setAllTopics] = useState<TopicStat[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [activePrepSet, setActivePrepSet] = useState<PrepSetResponse | null>(null);

  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') || 'All';
  const topic = searchParams.get('topic') || 'All';
  const sort = searchParams.get('sort') || 'name_asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;

  // Load Company Details and Topics
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoadingCompany(true);
      try {
        const [compData, topicsData] = await Promise.all([
          api.getCompany(slug),
          api.getTopics(),
        ]);
        setCompany(compData);
        setAllTopics(topicsData);
      } catch (err) {
        console.error('Failed to load company details:', err);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompanyData();
  }, [slug]);

  // Load Problems for this Company
  useEffect(() => {
    if (activePrepSet) return;

    const fetchProblems = async () => {
      setLoadingProblems(true);
      try {
        const res = await api.getCompanyProblems(slug, {
          search: search || undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          topic: topic !== 'All' ? topic : undefined,
          sort,
          page,
          limit,
        });
        setProblems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Failed to load company problems:', err);
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchProblems();
  }, [slug, search, difficulty, topic, sort, page, activePrepSet]);

  const handleSearchChange = (newSearch: string) => {
    setActivePrepSet(null);
    onUpdateParams({ search: newSearch, page: '1' });
  };

  const handleDifficultyChange = (newDiff: string) => {
    setActivePrepSet(null);
    onUpdateParams({ difficulty: newDiff, page: '1' });
  };

  const handleTopicChange = (newTopic: string) => {
    setActivePrepSet(null);
    onUpdateParams({ topic: newTopic, page: '1' });
  };

  const handleSortChange = (newSort: string) => {
    onUpdateParams({ sort: newSort, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    onUpdateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setActivePrepSet(null);
    onUpdateParams({ search: '', difficulty: 'All', topic: 'All', page: '1' });
  };

  const handlePrepSetGenerated = (prepSet: PrepSetResponse) => {
    setActivePrepSet(prepSet);
    setProblems(prepSet.problems);
    setTotal(prepSet.total_selected);
    setTotalPages(1);
  };

  if (loadingCompany && !company) {
    return (
      <div className="py-12 space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Company Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          Could not find company matching "{slug}".
        </p>
        <button
          onClick={() => onNavigate('/companies')}
          className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold cursor-pointer"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/companies')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all companies</span>
      </button>

      {/* Company Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white text-2xl font-black shadow-md shadow-brand-500/20">
              {company.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {company.name}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {company.problem_count} Questions
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl font-medium">
                Frequently appearing DSA interview and online assessment questions for {company.name}.
              </p>
            </div>
          </div>

          {/* Actions: Preparation Mode Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPrepModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Target className="h-4 w-4" />
              <span>Enter Preparation Mode</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Difficulty Breakdown</span>
            <span>Total: {company.problem_count} problems</span>
          </div>
          <ProgressBar
            easy={company.easy_count}
            medium={company.medium_count}
            hard={company.hard_count}
            total={company.problem_count}
            showLabels={true}
            size="md"
          />
        </div>
      </div>

      {/* Active Prep Set Alert Banner if generated */}
      {activePrepSet && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-brand-500/15 via-indigo-500/10 to-transparent border border-brand-500/30 text-brand-900 dark:text-brand-100 animate-slide-in">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">{activePrepSet.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Targeting: {activePrepSet.difficulty_filter || 'All'} · {activePrepSet.total_selected} focused problems
              </p>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Exit Sprint</span>
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
              const isSelected = difficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100'
                  }`}
                >
                  {diff}
                  {diff === 'All'
                    ? ` (${company.problem_count})`
                    : diff === 'Easy'
                    ? ` (${company.easy_count})`
                    : diff === 'Medium'
                    ? ` (${company.medium_count})`
                    : ` (${company.hard_count})`}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder={`Search ${company.name} questions...`}
            className="w-full md:w-72"
          />
        </div>

        {/* Topic Filter Chips Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Topics:
          </span>
          <button
            onClick={() => handleTopicChange('All')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
              topic === 'All'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Topics
          </button>
          {allTopics.slice(0, 15).map((t) => {
            const isSelected = topic === t.name;
            return (
              <button
                key={t.name}
                onClick={() => handleTopicChange(t.name)}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Table */}
      <ProblemTable
        problems={problems}
        loading={loadingProblems}
        onNavigate={onNavigate}
        onTopicClick={(clickedTopic) => handleTopicChange(clickedTopic)}
        showCompanyTags={false}
        onResetFilters={handleResetFilters}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {/* Pagination */}
      {!activePrepSet && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Preparation Mode Modal */}
      <PreparationModeModal
        companyName={company.name}
        companySlug={company.slug}
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
        onGenerated={handlePrepSetGenerated}
      />
    </div>
  );
};
