import React, { useEffect, useState } from 'react';
import {
  Building2,
  Code2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Search,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import type { PlatformStats } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import { CompanyCard } from '../components/companies/CompanyCard';
import { LoadingState } from '../components/common/LoadingState';
import { useProgress } from '../context/ProgressContext';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenSearch,
}) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getTotalSolvedCount } = useProgress();
  const solvedTotal = getTotalSolvedCount();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-16 py-6 sm:py-10 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-8 sm:p-14 shadow-sm">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          {/* Brand Badge */}
          <div className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200/80 dark:border-brand-800/60 shadow-sm">
            <span className="text-xs font-black tracking-widest text-brand-700 dark:text-brand-300 uppercase">
              OneXCode
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-tight">
              Code. Practice. Conquer.
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
            Prepare for the <br className="hidden sm:inline" />
            <span className="gradient-text">companies you want.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover and practice company-specific Data Structures & Algorithms problems collected from verified placement assessments. Prepare strategically and ace your technical interviews.
          </p>

          {/* Actions & Search Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenSearch}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Quick Search (Ctrl + K)</span>
            </button>

            <button
              onClick={() => onNavigate('/companies')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-brand-500" />
              <span>Browse All Companies</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Difficulty Jump Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Filter by difficulty:</span>
            <button
              onClick={() => onNavigate('/problems?difficulty=Easy')}
              className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Easy
            </button>
            <button
              onClick={() => onNavigate('/problems?difficulty=Medium')}
              className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Medium
            </button>
            <button
              onClick={() => onNavigate('/problems?difficulty=Hard')}
              className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Hard
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-500" />
            <span>Platform Overview & Dataset Metrics</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time database stats
          </span>
        </div>

        {loading || !stats ? (
          <LoadingState type="stats" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title="Target Companies"
              value={stats.total_companies}
              subtitle="210 tech companies indexed"
              icon={Building2}
              variant="brand"
            />
            <StatsCard
              title="Unique DSA Problems"
              value={stats.total_problems}
              subtitle="814 curated algorithms"
              icon={Code2}
              variant="slate"
            />
            <StatsCard
              title="Company Associations"
              value={stats.total_company_problems}
              subtitle="11,917 question appearances"
              icon={Target}
              variant="amber"
            />
            <StatsCard
              title="Your Solved Problems"
              value={solvedTotal}
              subtitle="Tracked in your dashboard"
              icon={CheckCircle2}
              variant="emerald"
            />
          </div>
        )}
      </section>

      {/* Popular Companies Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Popular Companies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Explore companies with high question volume in recent placement rounds
            </p>
          </div>
          <button
            onClick={() => onNavigate('/companies')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All 210 Companies</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading || !stats ? (
          <LoadingState type="card" count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.popular_companies.slice(0, 6).map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => onNavigate(`/companies/${company.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Key Strategic Features Highlights */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Engineered for Placement Success
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every feature is crafted to maximize your revision efficiency before Online Assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Company Preparation Sprints
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate 10, 25, or 50 problem focused sets tailored to your specific upcoming company interviews.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Zero Fake Frequency Integrity
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pure data grounding without fabricated weights or fake frequency claims. Exact problem-to-company mappings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Personal Progress Dashboard
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track solved, attempted, and bookmarked problems across companies with instant local storage persistence.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
