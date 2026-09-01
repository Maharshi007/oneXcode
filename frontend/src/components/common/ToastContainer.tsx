import React from 'react';
import { useProgress } from '../../context/ProgressContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProgress();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
            default:
              return <Info className="h-5 w-5 text-brand-500 shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all animate-slide-in"
          >
            {getIcon()}
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
