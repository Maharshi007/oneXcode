import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  Code2,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Terminal,
  User,
  X,
  CheckCircle2,
  Building2,
  ListChecks,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/auth';
import { useProgress } from '../../context/ProgressContext';

import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  currentPath: string;
  onNavigate: (
    path: string,
    newParams?: Record<string, string>
  ) => void;
  onOpenSearch: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    label: 'Companies',
    path: '/companies',
    icon: Building2,
  },
  {
    label: 'Problems',
    path: '/problems',
    icon: ListChecks,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const { getTotalSolvedCount } = useProgress();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const solvedCount = getTotalSolvedCount();

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to load authenticated user:', error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const storedTheme = localStorage.getItem('onexcode-theme');

    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      return;
    }

    if (storedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      return;
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    setDarkMode(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((previous) => {
      const next = !previous;

      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('onexcode-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('onexcode-theme', 'light');
      }

      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Close account menu when clicking outside
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenSearch();
      }

      if (event.key === 'Escape') {
        setAccountOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [onOpenSearch]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNavigation = (path: string) => {
    setMobileOpen(false);
    setAccountOpen(false);
    onNavigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  // ---------------------------------------------------------------------------
  // Authentication actions
  // ---------------------------------------------------------------------------

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setAccountOpen(false);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out failed:', error);
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // ---------------------------------------------------------------------------
  // User information
  // ---------------------------------------------------------------------------

  const userEmail =
    user?.email ||
    user?.user_metadata?.email ||
    'Signed-in user';

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    userEmail.split('@')[0] ||
    'User';

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    '';

  const userInitial =
    userName.charAt(0).toUpperCase() || 'U';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Brand                                                           */}
        {/* ---------------------------------------------------------------- */}

        <button
          type="button"
          onClick={() => handleNavigation('/')}
          className="group flex shrink-0 items-center gap-2.5 text-left"
          aria-label="Go to OneXCode home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
            <Terminal className="h-[18px] w-[18px]" />
          </div>

          <div className="hidden leading-none sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-extrabold tracking-tight text-slate-950 dark:text-white">
                OneXCode
              </span>

              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                DSA
              </span>
            </div>

            <span className="mt-1 block text-[9px] font-medium tracking-tight text-slate-500 dark:text-slate-400">
              Code. Practice. Conquer.
            </span>
          </div>
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Desktop Navigation                                               */}
        {/* ---------------------------------------------------------------- */}

        <nav className="ml-8 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/* Desktop Right Side                                               */}
        {/* ---------------------------------------------------------------- */}

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {/* Search */}

          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex h-9 w-[245px] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 text-left transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-500" />

            <span className="flex-1 truncate text-[11px] font-medium text-slate-400">
              Search problems, companies...
            </span>

            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Solved */}

          <button
            type="button"
            onClick={() => handleNavigation('/dashboard')}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
            title="View your progress"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{solvedCount} solved</span>
          </button>

          {/* Theme */}

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            aria-label={
              darkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              darkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Account */}

          <div className="relative" ref={accountRef}>
            {authLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountOpen((previous) => !previous)}
                  className={`flex h-9 items-center gap-1.5 rounded-lg pl-1 pr-1.5 transition-colors ${
                    accountOpen
                      ? 'bg-slate-100 dark:bg-slate-900'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                      {userInitial}
                    </span>
                  )}

                  <ChevronDown
                    className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform sm:block ${
                      accountOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+10px)] w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                            {userInitial}
                          </span>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-slate-900 dark:text-slate-100">
                            {userName}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => handleNavigation('/dashboard')}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                        role="menuitem"
                      >
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                        <span>View Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <User className="h-3.5 w-3.5" />
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Mobile Actions                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {user && (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((previous) => !previous)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Account"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {userInitial}
                  </span>
                )}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="truncate text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                      {userName}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                      {userEmail}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => handleNavigation('/dashboard')}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <BarChart3 className="h-4 w-4 text-slate-400" />
                      Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((previous) => !previous)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label={
              mobileOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile Navigation                                                 */}
      {/* ------------------------------------------------------------------ */}

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold ${
                    active
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}

                  {item.label === 'Dashboard' && (
                    <span className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {solvedCount} solved
                    </span>
                  )}
                </button>
              );
            })}

            {!user && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                <User className="h-4 w-4" />
                Sign in with Google
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};