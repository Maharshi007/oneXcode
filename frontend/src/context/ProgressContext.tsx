import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ProblemStatus, ProblemProgress, UserProgressState } from '../types';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface ProgressContextType {
  progressState: UserProgressState;
  getStatus: (problemId: number) => ProblemStatus;
  isBookmarked: (problemId: number) => boolean;
  getNotes: (problemId: number) => string;
  setStatus: (problemId: number, status: ProblemStatus, problemName?: string) => void;
  toggleBookmark: (problemId: number, problemName?: string) => void;
  saveNotes: (problemId: number, notes: string) => void;
  getTotalSolvedCount: () => number;
  getTotalAttemptedCount: () => number;
  resetAllProgress: () => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const STORAGE_KEY = 'preptrack_user_progress_v1';

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progressState, setProgressState] = useState<UserProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load user progress from localStorage:', e);
    }
    return {
      problems: {},
      lastActive: new Date().toISOString(),
    };
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));
    } catch (e) {
      console.error('Failed to save progress to localStorage:', e);
    }
  }, [progressState]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getStatus = useCallback((problemId: number): ProblemStatus => {
    return progressState.problems[problemId]?.status || 'not_started';
  }, [progressState]);

  const isBookmarked = useCallback((problemId: number): boolean => {
    return !!progressState.problems[problemId]?.isBookmarked;
  }, [progressState]);

  const getNotes = useCallback((problemId: number): string => {
    return progressState.problems[problemId]?.notes || '';
  }, [progressState]);

  const setStatus = useCallback((problemId: number, status: ProblemStatus, problemName?: string) => {
    setProgressState((prev) => {
      const existing = prev.problems[problemId] || {
        status: 'not_started',
        updatedAt: new Date().toISOString(),
      };

      const updated: ProblemProgress = {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        problems: {
          ...prev.problems,
          [problemId]: updated,
        },
        lastActive: new Date().toISOString(),
      };
    });

    if (status === 'solved') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#38bdf8', '#6366f1', '#f59e0b'],
      });
      addToast({
        title: 'Problem Solved! 🎉',
        description: problemName ? `Marked "${problemName}" as solved.` : 'Added to your solved problems.',
        type: 'success',
      });
    } else if (status === 'attempted') {
      addToast({
        title: 'In Progress 📝',
        description: problemName ? `Marked "${problemName}" as in progress.` : 'Marked as attempted.',
        type: 'info',
      });
    }
  }, [addToast]);

  const toggleBookmark = useCallback((problemId: number, problemName?: string) => {
    setProgressState((prev) => {
      const existing = prev.problems[problemId] || {
        status: 'not_started',
        updatedAt: new Date().toISOString(),
      };
      const newBookmarked = !existing.isBookmarked;

      if (newBookmarked) {
        addToast({
          title: 'Saved to Bookmarks 🔖',
          description: problemName || 'Problem bookmarked for later revision.',
          type: 'info',
        });
      }

      return {
        ...prev,
        problems: {
          ...prev.problems,
          [problemId]: {
            ...existing,
            isBookmarked: newBookmarked,
            updatedAt: new Date().toISOString(),
          },
        },
        lastActive: new Date().toISOString(),
      };
    });
  }, [addToast]);

  const saveNotes = useCallback((problemId: number, notes: string) => {
    setProgressState((prev) => {
      const existing = prev.problems[problemId] || {
        status: 'not_started',
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        problems: {
          ...prev.problems,
          [problemId]: {
            ...existing,
            notes,
            updatedAt: new Date().toISOString(),
          },
        },
        lastActive: new Date().toISOString(),
      };
    });
    addToast({
      title: 'Notes Saved',
      description: 'Your notes have been saved locally.',
      type: 'info',
    });
  }, [addToast]);

  const getTotalSolvedCount = useCallback((): number => {
    return Object.values(progressState.problems).filter((p) => p.status === 'solved').length;
  }, [progressState]);

  const getTotalAttemptedCount = useCallback((): number => {
    return Object.values(progressState.problems).filter((p) => p.status === 'attempted').length;
  }, [progressState]);

  const resetAllProgress = useCallback(() => {
    setProgressState({
      problems: {},
      lastActive: new Date().toISOString(),
    });
    addToast({
      title: 'Progress Reset',
      description: 'All problem progress has been cleared.',
      type: 'warning',
    });
  }, [addToast]);

  return (
    <ProgressContext.Provider
      value={{
        progressState,
        getStatus,
        isBookmarked,
        getNotes,
        setStatus,
        toggleBookmark,
        saveNotes,
        getTotalSolvedCount,
        getTotalAttemptedCount,
        resetAllProgress,
        toasts,
        removeToast,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within a ProgressProvider');
  return context;
};
