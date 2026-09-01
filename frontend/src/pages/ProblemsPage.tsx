import React, { useEffect, useState } from 'react';
import { Code2 } from 'lucide-react';
import { api } from '../services/api';
import type { Problem, Company, TopicStat } from '../types';
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

  // Fetch problems on filter changes
  useEffect(() => {
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
  }, [search, difficulty, topic, company, sort, page]);

  const handleSearchChange = (newSearch: string) => {
    onUpdateParams({ search: newSearch, page: '1' });
  };

  const handleDifficultyChange = (newDiff: string) => {
    onUpdateParams({ difficulty: newDiff, page: '1' });
  };

  const handleTopicChange = (newTopic: string) => {
    onUpdateParams({ topic: newTopic, page: '1' });
  };

  const handleCompanyChange = (newComp: string) => {
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
    onUpdateParams({ search: '', difficulty: 'All', topic: 'All', company: 'All', page: '1' });
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

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={total}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
