import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ToastContainer } from './components/common/ToastContainer';

import { LandingPage } from './pages/LandingPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { DashboardPage } from './pages/DashboardPage';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync state with browser URL
  const navigate = useCallback((path: string, newParams?: Record<string, string>) => {
    let fullUrl = path;
    const params = new URLSearchParams(newParams || {});
    
    // If path has embedded query string e.g. /problems?difficulty=Easy
    if (path.includes('?')) {
      const [basePath, qs] = path.split('?');
      fullUrl = basePath;
      const parsedQs = new URLSearchParams(qs);
      parsedQs.forEach((val, key) => params.set(key, val));
    }

    const qsString = params.toString();
    const finalUrl = qsString ? `${fullUrl}?${qsString}` : fullUrl;

    window.history.pushState({}, '', finalUrl);
    setCurrentPath(fullUrl);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateParams = useCallback((paramsUpdate: Record<string, string>) => {
    const current = new URLSearchParams(window.location.search);
    Object.entries(paramsUpdate).forEach(([key, val]) => {
      if (val === '' || val === 'All' || val === undefined) {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });

    const qsString = current.toString();
    const finalUrl = qsString ? `${window.location.pathname}?${qsString}` : window.location.pathname;
    window.history.pushState({}, '', finalUrl);
    setSearchParams(current);
  }, []);

  // Handle browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Router matching
  const renderRoute = () => {
    // 1. Landing / Home
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }

    // 2. Dashboard
    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    // 3. Companies List
    if (currentPath === '/companies') {
      return (
        <CompaniesPage
          onNavigate={navigate}
          searchParams={searchParams}
          onUpdateParams={updateParams}
        />
      );
    }

    // 4. Company Detail: /companies/:slug
    if (currentPath.startsWith('/companies/')) {
      const slug = currentPath.replace('/companies/', '').split('/')[0];
      return (
        <CompanyDetailPage
          slug={slug}
          onNavigate={navigate}
          searchParams={searchParams}
          onUpdateParams={updateParams}
        />
      );
    }

    // 5. All Problems List
    if (currentPath === '/problems') {
      return (
        <ProblemsPage
          onNavigate={navigate}
          searchParams={searchParams}
          onUpdateParams={updateParams}
        />
      );
    }

    // 6. Problem Detail: /problems/:slug
    if (currentPath.startsWith('/problems/')) {
      const slug = currentPath.replace('/problems/', '').split('/')[0];
      return <ProblemDetailPage slug={slug} onNavigate={navigate} />;
    }

    // Fallback to Home
    return <LandingPage onNavigate={navigate} onOpenSearch={() => setIsSearchOpen(true)} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-8">
        {renderRoute()}
      </main>

      <Footer onNavigate={navigate} />

      <MobileNav
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <AppContent />
      </ProgressProvider>
    </ThemeProvider>
  );
}
