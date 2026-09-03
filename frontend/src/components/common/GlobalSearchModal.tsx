import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Code2, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api';
import type { Company, Problem } from '../../types';
import { DifficultyBadge } from './DifficultyBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setCompanies([]);
      setProblems([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setCompanies([]);
      setProblems([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [compRes, probRes] = await Promise.all([
          api.getCompanies({ search: query, limit: 5 }),
          api.getProblems({ search: query, limit: 6 }),
        ]);
        setCompanies(compRes.items);
        setProblems(probRes.items);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 gap-2">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, DSA problems, or topics..."
            className="flex-1 bg-transparent px-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-none">
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close search"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              Searching dataset...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Type <strong className="text-slate-800 dark:text-slate-200 font-bold">"Amazon"</strong>,{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">"Two Sum"</strong>, or{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">"Binary Search"</strong> to explore.
            </div>
          )}

          {!loading && query && companies.length === 0 && problems.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              No matching companies or problems found for "{query}".
            </div>
          )}

          {/* Companies Result */}
          {companies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5 text-brand-500" />
                <span>Companies</span>
              </div>
              <div className="space-y-1 mt-1">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate(`/companies/${c.slug}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {c.problem_count} DSA Problems
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Problems Result */}
          {problems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Code2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>Problems</span>
              </div>
              <div className="space-y-1 mt-1">
                {problems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate(`/problems/${p.slug}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <DifficultyBadge difficulty={p.difficulty} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                          {p.topics.join(' · ')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
