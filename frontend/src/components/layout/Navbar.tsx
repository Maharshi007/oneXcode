import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Home,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Terminal,
  User,
  X,
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

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const accountRef = useRef<HTMLDivElement | null>(null);

  const { getTotalSolvedCount } = useProgress();

  const solvedCount = getTotalSolvedCount();

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (mounted) {
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (!session?.user) {
        setAccountOpen(false);
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
    const savedTheme = localStorage.getItem('onexcode-theme');

    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      setDarkMode(prefersDark);

      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
      const target = event.target as Node | null;

      if (!target) return;

      if (
        accountRef.current &&
        !accountRef.current.contains(target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard shortcut
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === 'k';

      if (!isShortcut) return;

      event.preventDefault();
      onOpenSearch();
    };

    window.addEventListener(
      'keydown',
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboard
      );
    };
  }, [onOpenSearch]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNavigation = (
    path: string,
    newParams?: Record<string, string>
  ) => {
    setAccountOpen(false);
    setMobileOpen(false);

    onNavigate(path, newParams);
  };

  // ---------------------------------------------------------------------------
  // Google Sign In
  // ---------------------------------------------------------------------------

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(
        'Google sign-in failed:',
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Sign Out
  // ---------------------------------------------------------------------------

  const handleSignOut = async () => {
    try {
      /*
       * Close UI immediately so the dropdown cannot remain
       * open while Supabase processes the sign-out.
       */
      setAccountOpen(false);
      setMobileOpen(false);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          'Sign out failed:',
          error
        );
        return;
      }

      /*
       * Explicitly clear local auth state.
       * Supabase's SIGNED_OUT event will also update it,
       * but doing this here makes the UI deterministic.
       */
      setUser(null);

      /*
       * Return the user to the home page after logout.
       */
      onNavigate('/');
    } catch (error) {
      console.error(
        'Sign out failed:',
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // User information
  // ---------------------------------------------------------------------------

  const userMetadata = user?.user_metadata ?? {};

  const fullName =
    userMetadata.full_name ||
    userMetadata.name ||
    'User';

  const email =
    user?.email ||
    '';

  const avatarUrl =
    userMetadata.avatar_url ||
    userMetadata.picture ||
    '';

  const avatarInitial =
    fullName
      .trim()
      .charAt(0)
      .toUpperCase() || 'U';

  // ---------------------------------------------------------------------------
  // Navigation items
  // ---------------------------------------------------------------------------

  const navItems = [
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

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }

    return (
      currentPath === path ||
      currentPath.startsWith(`${path}/`)
    );
  };

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  return (
    <header
      className="
        sticky
        top-0
        z-[100]
        w-full
        border-b
        border-slate-800/80
        bg-slate-950/95
        backdrop-blur-xl
      "
    >
      <div
        className="
          relative
          z-[100]
          mx-auto
          flex
          h-20
          max-w-[1800px]
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ================================================================= */}
        {/* LEFT SECTION                                                      */}
        {/* ================================================================= */}

        <div className="flex min-w-0 items-center gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              handleNavigation('/')
            }
            className="
              group
              flex
              shrink-0
              items-center
              gap-2.5
              text-left
              cursor-pointer
            "
            aria-label="Go to OneXCode home"
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-sky-600
                text-white
                shadow-lg
                shadow-sky-950/30
                transition-transform
                duration-200
                group-hover:scale-[1.03]
              "
            >
              <Terminal className="h-5 w-5" />
            </div>

            <div className="hidden min-[420px]:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  OneXCode
                </span>

                <span
                  className="
                    rounded-md
                    border
                    border-sky-800/60
                    bg-sky-950/70
                    px-1.5
                    py-0.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-widest
                    leading-none
                    text-sky-400
                  "
                >
                  DSA
                </span>
              </div>

              <span
                className="
                  mt-0.5
                  block
                  text-[9px]
                  font-medium
                  leading-tight
                  tracking-tight
                  text-slate-400
                "
              >
                Code. Practice. Conquer.
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="
              hidden
              items-center
              gap-1
              lg:flex
            "
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`
                    inline-flex
                    h-11
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    text-sm
                    font-semibold
                    transition-colors
                    cursor-pointer
                    ${
                      active
                        ? `
                          bg-sky-950/70
                          text-sky-400
                        `
                        : `
                          text-slate-400
                          hover:bg-slate-900
                          hover:text-slate-100
                        `
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ================================================================= */}
        {/* RIGHT SECTION                                                     */}
        {/* ================================================================= */}

        <div className="flex shrink-0 items-center gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="
              hidden
              h-10
              w-[240px]
              items-center
              justify-between
              rounded-xl
              border
              border-slate-800
              bg-slate-900/80
              px-3
              text-left
              text-xs
              font-medium
              text-slate-400
              transition-colors
              hover:border-slate-700
              hover:bg-slate-900
              hover:text-slate-200
              xl:flex
              cursor-pointer
            "
            aria-label="Search problems"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />

              <span className="truncate">
                Search problems, companies...
              </span>
            </span>

            <kbd
              className="
                ml-2
                shrink-0
                rounded-md
                border
                border-slate-700
                bg-slate-950
                px-1.5
                py-0.5
                text-[10px]
                font-medium
                text-slate-500
              "
            >
              Ctrl K
            </kbd>
          </button>

          {/* Compact Search button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              text-slate-400
              transition-colors
              hover:border-slate-700
              hover:text-slate-100
              xl:hidden
              cursor-pointer
            "
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Solved Count */}
          <button
            type="button"
            onClick={() =>
              handleNavigation('/dashboard')
            }
            className="
              hidden
              h-10
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-900/70
              bg-emerald-950/30
              px-3
              text-xs
              font-semibold
              text-emerald-400
              transition-colors
              hover:bg-emerald-950/50
              sm:flex
              cursor-pointer
            "
            title="View your dashboard"
          >
            <CheckCircle2 className="h-4 w-4" />

            <span>
              {solvedCount} solved
            </span>
          </button>

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              text-slate-400
              transition-colors
              hover:border-slate-700
              hover:text-slate-100
              md:flex
              cursor-pointer
            "
            aria-label={
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

          {/* =============================================================== */}
          {/* ACCOUNT                                                         */}
          {/* =============================================================== */}

          <div
            ref={accountRef}
            className="
              relative
              z-[110]
            "
          >
            {/* Account trigger */}
            {user ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setAccountOpen(
                    (previous) => !previous
                  );
                }}
                className={`
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-1.5
                  transition-colors
                  cursor-pointer
                  ${
                    accountOpen
                      ? `
                        border-slate-500
                        bg-slate-900
                      `
                      : `
                        border-slate-700
                        bg-slate-900/80
                        hover:border-slate-600
                      `
                  }
                `}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="
                      h-8
                      w-8
                      rounded-lg
                      object-cover
                    "
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-sky-600
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    {avatarInitial}
                  </div>
                )}

                <ChevronDown
                  className={`
                    mr-1
                    hidden
                    h-4
                    w-4
                    text-slate-400
                    transition-transform
                    sm:block
                    ${
                      accountOpen
                        ? 'rotate-180'
                        : ''
                    }
                  `}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  bg-sky-600
                  px-3.5
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  transition-colors
                  hover:bg-sky-500
                  cursor-pointer
                "
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Sign in
                </span>
              </button>
            )}

            {/* ============================================================= */}
            {/* DESKTOP ACCOUNT DROPDOWN                                      */}
            {/* ============================================================= */}

            {user && accountOpen && (
              <div
                className="
                  pointer-events-auto
                  absolute
                  right-0
                  top-full
                  z-[120]
                  mt-2
                  w-[320px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950
                  shadow-2xl
                  shadow-black/40
                "
                role="menu"
                aria-label="Account menu"
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              >
                {/* User info */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    border-b
                    border-slate-800
                    px-4
                    py-4
                  "
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="
                        h-10
                        w-10
                        shrink-0
                        rounded-full
                        object-cover
                      "
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-sky-600
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {avatarInitial}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-slate-100
                      "
                    >
                      {fullName}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        text-slate-400
                      "
                    >
                      {email}
                    </p>
                  </div>
                </div>

                {/* Menu actions */}
                <div className="p-2">
                  {/* Dashboard */}
                  <button
                    type="button"
                    role="menuitem"
                    onMouseDown={(event) => {
                      /*
                       * Prevent the document-level mousedown
                       * listener from closing the menu before
                       * navigation executes.
                       */
                      event.preventDefault();
                      event.stopPropagation();

                      handleNavigation(
                        '/dashboard'
                      );
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-slate-300
                      transition-colors
                      hover:bg-slate-900
                      hover:text-white
                      cursor-pointer
                    "
                  >
                    <BarChart3
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-slate-500
                      "
                    />

                    <span>
                      View Dashboard
                    </span>
                  </button>

                  {/* Sign out */}
                  <button
                    type="button"
                    role="menuitem"
                    onMouseDown={(event) => {
                      /*
                       * Same protection as Dashboard.
                       */
                      event.preventDefault();
                      event.stopPropagation();

                      void handleSignOut();
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-semibold
                      text-red-400
                      transition-colors
                      hover:bg-red-950/30
                      hover:text-red-300
                      cursor-pointer
                    "
                  >
                    <LogOut
                      className="
                        h-4
                        w-4
                        shrink-0
                      "
                    />

                    <span>
                      Sign out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (previous) => !previous
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              text-slate-400
              transition-colors
              hover:text-white
              lg:hidden
              cursor-pointer
            "
            aria-label={
              mobileOpen
                ? 'Close navigation'
                : 'Open navigation'
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

      {/* ===================================================================== */}
      {/* MOBILE NAVIGATION                                                     */}
      {/* ===================================================================== */}

      {mobileOpen && (
        <div
          className="
            relative
            z-[105]
            border-t
            border-slate-800
            bg-slate-950
            lg:hidden
          "
        >
          <div
            className="
              mx-auto
              max-w-[1800px]
              space-y-1
              px-4
              py-3
              sm:px-6
            "
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    transition-colors
                    cursor-pointer
                    ${
                      active
                        ? `
                          bg-sky-950/70
                          text-sky-400
                        `
                        : `
                          text-slate-400
                          hover:bg-slate-900
                          hover:text-white
                        `
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile solved count */}
            <button
              type="button"
              onClick={() =>
                handleNavigation('/dashboard')
              }
              className="
                flex
                w-full
                items-center
                justify-between
                rounded-xl
                px-3
                py-3
                text-left
                text-sm
                font-semibold
                text-emerald-400
                transition-colors
                hover:bg-slate-900
                cursor-pointer
              "
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4" />
                <span>Progress</span>
              </span>

              <span>
                {solvedCount} solved
              </span>
            </button>

            {/* Mobile theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                text-sm
                font-semibold
                text-slate-400
                transition-colors
                hover:bg-slate-900
                hover:text-white
                cursor-pointer
              "
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}

              <span>
                {darkMode
                  ? 'Light mode'
                  : 'Dark mode'}
              </span>
            </button>

            {/* Mobile auth */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  void handleSignOut();
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-red-400
                  transition-colors
                  hover:bg-red-950/30
                  hover:text-red-300
                  cursor-pointer
                "
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  bg-sky-600
                  px-3
                  py-3
                  text-left
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-sky-500
                  cursor-pointer
                "
              >
                <User className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};