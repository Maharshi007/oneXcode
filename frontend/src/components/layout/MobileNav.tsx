import React from 'react';
import { Home, Building2, Code2, LayoutDashboard, Search } from 'lucide-react';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const items = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Search', action: onOpenSearch, icon: Search },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = item.path
          ? item.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(item.path)
          : false;

        if (item.action) {
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center p-1.5 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
            </button>
          );
        }

        return (
          <button
            key={idx}
            onClick={() => item.path && onNavigate(item.path)}
            className={`flex flex-col items-center justify-center p-1.5 transition-colors cursor-pointer ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 font-medium'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
