import React from 'react';
import { Sun, Moon, Search, Sparkles, Terminal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProgress } from '../../context/ProgressContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { getTotalSolvedCount } = useProgress();
  const solvedCount = getTotalSolvedCount();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Companies', path: '/companies' },
    { name: 'All Problems', path: '/problems' },
    { name: 'My Dashboard', path: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-50">
                  OneXCode
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded border border-brand-200/60 dark:border-brand-800/60 leading-none">
                  DSA
                </span>
              </div>
              <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 tracking-tight block leading-tight mt-0.5">
                Code. Practice. Conquer.
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(link.path);

              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline font-medium">Search problems, companies...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              Ctrl K
            </kbd>
          </button>

          {/* User Solved Counter Badge */}
          <button
            onClick={() => onNavigate('/dashboard')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
            title="View your preparation progress"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Solved: <strong>{solvedCount}</strong></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Creator Credit Badge */}
          <div className="hidden lg:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <span>By <strong className="text-slate-800 dark:text-slate-200 font-bold">Maharshi</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
