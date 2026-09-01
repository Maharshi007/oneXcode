import React from 'react';
import { Terminal, ShieldCheck, Heart, Code2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-xs">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                  OneXCode
                </span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-tight block">
                  Code. Practice. Conquer.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Targeted Data Structures & Algorithms (DSA) preparation for tech placements, Online Assessments (OAs), and Software Engineering interviews across top companies.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Dataset verified: 210 companies, 814 unique problems, 11,917 associations.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <button
                  onClick={() => onNavigate('/companies')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  All 210 Companies
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/problems')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  All Unique Problems
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Preparation Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Developer Portfolio Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Developer
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              Architected and designed with full-stack engineering by <strong className="text-slate-900 dark:text-slate-200">Maharshi</strong>.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 font-medium">
              <Code2 className="h-3.5 w-3.5 text-brand-500" />
              <span>FastAPI · PostgreSQL · React</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} OneXCode. Code. Practice. Conquer.</p>
          <div className="flex items-center gap-1 text-xs">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>by <strong className="text-slate-800 dark:text-slate-200">Maharshi</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
