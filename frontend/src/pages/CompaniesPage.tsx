import React, { useEffect, useState } from 'react';
import { Building2, ArrowUpDown } from 'lucide-react';
import { api } from '../services/api';
import type { Company } from '../types';
import { CompanyCard } from '../components/companies/CompanyCard';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

interface CompaniesPageProps {
  onNavigate: (path: string) => void;
  searchParams: URLSearchParams;
  onUpdateParams: (params: Record<string, string>) => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({
  onNavigate,
  searchParams,
  onUpdateParams,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'problems_desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 24;

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.getCompanies({
          search: search || undefined,
          sort,
          page,
          limit,
        });
        setCompanies(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search, sort, page]);

  const handleSearchChange = (newSearch: string) => {
    onUpdateParams({ search: newSearch, page: '1' });
  };

  const handleSortChange = (newSort: string) => {
    onUpdateParams({ sort: newSort, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    onUpdateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    onUpdateParams({ search: '', sort: 'problems_desc', page: '1' });
  };

  return (
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Target Companies Directory
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Explore 210 top companies and their frequently asked Data Structures & Algorithms interview questions.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search company name..."
            className="w-full sm:w-64"
          />

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-brand-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="problems_desc">Most Questions</option>
              <option value="problems_asc">Least Questions</option>
              <option value="name_asc">Alphabetical (A - Z)</option>
              <option value="name_desc">Alphabetical (Z - A)</option>
              <option value="hard_desc">Most Hard Questions</option>
              <option value="easy_desc">Most Easy Questions</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingState type="card" count={limit} />
      ) : companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description={`No matching companies found for "${search}". Try searching another name.`}
          onReset={handleReset}
          resetText="Clear Search"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onClick={() => onNavigate(`/companies/${company.slug}`)}
            />
          ))}
        </div>
      )}

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
