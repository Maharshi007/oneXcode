import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import confetti from 'canvas-confetti';

import {
  ProblemStatus,
  ProblemProgress,
  UserProgressState,
} from '../types';

import { api } from '../services/api';
import { supabase } from '../lib/supabase';

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

  setStatus: (
    problemId: number,
    status: ProblemStatus,
    problemName?: string
  ) => void;

  toggleBookmark: (
    problemId: number,
    problemName?: string
  ) => void;

  saveNotes: (
    problemId: number,
    notes: string
  ) => void;

  getTotalSolvedCount: () => number;
  getTotalAttemptedCount: () => number;

  resetAllProgress: () => Promise<void>;

  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

/*
 * IMPORTANT:
 *
 * Progress is now isolated by authentication identity.
 *
 * Guest:
 *   preptrack_user_progress_guest_v1
 *
 * Authenticated user:
 *   preptrack_user_progress_<user-id>_v1
 *
 * The old global key:
 *   preptrack_user_progress_v1
 *
 * is intentionally no longer used because it could contain
 * progress belonging to multiple accounts.
 */
const GUEST_STORAGE_KEY = 'preptrack_user_progress_guest_v1';

const getUserStorageKey = (userId: string) =>
  `preptrack_user_progress_${userId}_v1`;

const ProgressContext =
  createContext<ProgressContextType | undefined>(undefined);

const createEmptyProgress = (): UserProgressState => ({
  problems: {},
  lastActive: new Date().toISOString(),
});

const readProgressFromStorage = (
  storageKey: string
): UserProgressState => {
  try {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.problems &&
        typeof parsed.problems === 'object'
      ) {
        return {
          ...parsed,
          problems: parsed.problems,
          lastActive:
            parsed.lastActive ||
            new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.error(
      `Failed to load progress from localStorage (${storageKey}):`,
      error
    );
  }

  return createEmptyProgress();
};

export const ProgressProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // -------------------------------------------------------------------------
  // Local progress state
  // -------------------------------------------------------------------------

  const [progressState, setProgressState] =
    useState<UserProgressState>(() =>
      readProgressFromStorage(GUEST_STORAGE_KEY)
    );

  const [toasts, setToasts] =
    useState<ToastMessage[]>([]);

  /*
   * Tracks which localStorage key currently belongs to
   * the in-memory progress state.
   *
   * Example:
   *
   * guest:
   *   preptrack_user_progress_guest_v1
   *
   * user A:
   *   preptrack_user_progress_<A-id>_v1
   *
   * user B:
   *   preptrack_user_progress_<B-id>_v1
   */
  const activeStorageKeyRef =
    useRef(GUEST_STORAGE_KEY);

  /*
   * Prevents the persistence effect from writing the previous
   * account's state into the newly selected account's storage
   * while account switching/hydration is happening.
   */
  const isHydratingRef = useRef(false);

  /*
   * Prevents state updates after the provider has unmounted.
   */
  const mountedRef = useRef(true);

  // -------------------------------------------------------------------------
  // Toast helpers
  // -------------------------------------------------------------------------

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = Math.random()
        .toString(36)
        .substring(2, 9);

      setToasts((prev) => [
        ...prev,
        {
          ...toast,
          id,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((item) => item.id !== id)
        );
      }, 4000);
    },
    []
  );

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    },
    []
  );

  // -------------------------------------------------------------------------
  // Persist local progress
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (isHydratingRef.current) {
      return;
    }

    try {
      localStorage.setItem(
        activeStorageKeyRef.current,
        JSON.stringify(progressState)
      );
    } catch (error) {
      console.error(
        'Failed to save progress to localStorage:',
        error
      );
    }
  }, [progressState]);

  // -------------------------------------------------------------------------
  // Load progress for authenticated user
  // -------------------------------------------------------------------------

  const loadAuthenticatedProgress = useCallback(
    async (
      userId: string,
      shouldReloadLocalState: boolean
    ) => {
      const userStorageKey =
        getUserStorageKey(userId);

      /*
       * Switch localStorage namespace when the authenticated
       * identity changes.
       */
      if (
        shouldReloadLocalState ||
        activeStorageKeyRef.current !== userStorageKey
      ) {
        isHydratingRef.current = true;

        activeStorageKeyRef.current =
          userStorageKey;

        const accountLocalProgress =
          readProgressFromStorage(
            userStorageKey
          );

        if (mountedRef.current) {
          setProgressState(accountLocalProgress);
        }

        /*
         * Allow the persistence effect to write only after
         * the account-specific state has been loaded.
         */
        isHydratingRef.current = false;
      }

      try {
        /*
         * Backend is the source of truth for authenticated
         * user's solved status.
         */
        const backendProgress =
          await api.getUserProgress();

        const solvedIds = new Set<number>(
          backendProgress.solved_problem_ids
        );

        if (!mountedRef.current) {
          return;
        }

        setProgressState((previous) => {
          const updatedProblems = {
            ...previous.problems,
          };

          /*
           * Reconcile existing local solved states with backend.
           *
           * If backend says a problem is solved:
           *     -> solved
           *
           * If local state says solved but backend does not:
           *     -> not_started
           *
           * We only modify the status.
           *
           * Notes and bookmarks remain untouched.
           */
          Object.entries(updatedProblems).forEach(
            ([problemIdString, problem]) => {
              const problemId =
                Number(problemIdString);

              if (
                problem.status === 'solved' &&
                !solvedIds.has(problemId)
              ) {
                updatedProblems[problemId] = {
                  ...problem,
                  status: 'not_started',
                  updatedAt:
                    new Date().toISOString(),
                };
              }
            }
          );

          /*
           * Apply backend solved state.
           */
          solvedIds.forEach((problemId) => {
            const existing =
              updatedProblems[problemId];

            updatedProblems[problemId] = {
              ...(existing || {}),
              status: 'solved',
              updatedAt:
                existing?.updatedAt ||
                new Date().toISOString(),
            };
          });

          return {
            ...previous,
            problems: updatedProblems,
          };
        });
      } catch (error) {
        /*
         * IMPORTANT:
         *
         * If backend loading fails, we do NOT destroy local
         * account-specific progress.
         *
         * This prevents a temporary backend/network failure
         * from appearing as data loss.
         */
        console.error(
          'Failed to load backend progress:',
          error
        );

        if (mountedRef.current) {
          addToast({
            title: 'Progress Sync Failed',
            description:
              'Your local account progress is preserved, but we could not sync with the server.',
            type: 'warning',
          });
        }
      }
    },
    [addToast]
  );

  // -------------------------------------------------------------------------
  // Authentication state handling
  // -------------------------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    const handleSession = async (
      session: {
        user?: {
          id?: string;
        } | null;
      } | null,
      forceReloadLocalState: boolean
    ) => {
      /*
       * ---------------------------------------------------------------------
       * GUEST
       * ---------------------------------------------------------------------
       */

      if (!session?.user?.id) {
        isHydratingRef.current = true;

        activeStorageKeyRef.current =
          GUEST_STORAGE_KEY;

        const guestProgress =
          readProgressFromStorage(
            GUEST_STORAGE_KEY
          );

        if (mountedRef.current) {
          setProgressState(guestProgress);
        }

        isHydratingRef.current = false;

        return;
      }

      /*
       * ---------------------------------------------------------------------
       * AUTHENTICATED USER
       * ---------------------------------------------------------------------
       */

      await loadAuthenticatedProgress(
        session.user.id,
        forceReloadLocalState
      );
    };

    /*
     * Load the current session when the provider starts.
     */
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await handleSession(session, true);
      } catch (error) {
        console.error(
          'Failed to initialize authentication state:',
          error
        );
      }
    };

    void initialize();

    /*
     * Listen for account changes.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        /*
         * SIGNED_IN:
         *
         * Always switch to the authenticated user's
         * account-specific localStorage.
         */
        if (event === 'SIGNED_IN') {
          void handleSession(session, true);
          return;
        }

        /*
         * TOKEN_REFRESHED:
         *
         * Same user normally remains active.
         * Refresh backend progress without unnecessarily
         * replacing the account's local namespace.
         */
        if (event === 'TOKEN_REFRESHED') {
          void handleSession(session, false);
          return;
        }

        /*
         * SIGNED_OUT:
         *
         * Immediately remove the previous user's progress
         * from in-memory state.
         *
         * The next state is the guest namespace.
         */
        if (event === 'SIGNED_OUT') {
          void handleSession(null, true);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadAuthenticatedProgress]);

  // -------------------------------------------------------------------------
  // Get problem status
  // -------------------------------------------------------------------------

  const getStatus = useCallback(
    (problemId: number): ProblemStatus => {
      return (
        progressState.problems[problemId]?.status ||
        'not_started'
      );
    },
    [progressState]
  );

  // -------------------------------------------------------------------------
  // Bookmark
  // -------------------------------------------------------------------------

  const isBookmarked = useCallback(
    (problemId: number): boolean => {
      return !!progressState.problems[problemId]
        ?.isBookmarked;
    },
    [progressState]
  );

  // -------------------------------------------------------------------------
  // Notes
  // -------------------------------------------------------------------------

  const getNotes = useCallback(
    (problemId: number): string => {
      return (
        progressState.problems[problemId]?.notes ||
        ''
      );
    },
    [progressState]
  );

  // -------------------------------------------------------------------------
  // Set problem status
  // -------------------------------------------------------------------------

  const setStatus = useCallback(
    (
      problemId: number,
      status: ProblemStatus,
      problemName?: string
    ) => {
      const previousStatus =
        progressState.problems[problemId]?.status ||
        'not_started';

      /*
       * ---------------------------------------------------------------------
       * Optimistic local update
       * ---------------------------------------------------------------------
       */

      setProgressState((previous) => {
        const existing =
          previous.problems[problemId] || {
            status: 'not_started',
            updatedAt: new Date().toISOString(),
          };

        const updated: ProblemProgress = {
          ...existing,
          status,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...previous,
          problems: {
            ...previous.problems,
            [problemId]: updated,
          },
          lastActive:
            new Date().toISOString(),
        };
      });

      /*
       * ---------------------------------------------------------------------
       * Backend synchronization
       * ---------------------------------------------------------------------
       */

      const syncBackend = async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          /*
           * Guest users use localStorage only.
           */
          if (!session?.access_token) {
            return;
          }

          /*
           * Only solved/not_started currently have backend
           * persistence.
           */
          if (status === 'solved') {
            await api.markProblemSolved(
              problemId
            );
          } else if (
            status === 'not_started' &&
            previousStatus === 'solved'
          ) {
            await api.markProblemUnsolved(
              problemId
            );
          }
        } catch (error) {
          console.error(
            `Failed to sync progress for problem ${problemId}:`,
            error
          );

          addToast({
            title: 'Sync Failed',
            description:
              'Your local progress is saved, but we could not sync it to your account.',
            type: 'warning',
          });
        }
      };

      void syncBackend();

      /*
       * ---------------------------------------------------------------------
       * User feedback
       * ---------------------------------------------------------------------
       */

      if (status === 'solved') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: {
            y: 0.8,
          },
          colors: [
            '#10b981',
            '#38bdf8',
            '#6366f1',
            '#f59e0b',
          ],
        });

        addToast({
          title: 'Problem Solved! 🎉',
          description: problemName
            ? `Marked "${problemName}" as solved.`
            : 'Added to your solved problems.',
          type: 'success',
        });
      } else if (status === 'attempted') {
        addToast({
          title: 'In Progress 📝',
          description: problemName
            ? `Marked "${problemName}" as in progress.`
            : 'Marked as attempted.',
          type: 'info',
        });
      }
    },
    [
      addToast,
      progressState,
    ]
  );

  // -------------------------------------------------------------------------
  // Bookmark
  // -------------------------------------------------------------------------

  const toggleBookmark = useCallback(
    (
      problemId: number,
      problemName?: string
    ) => {
      setProgressState((previous) => {
        const existing =
          previous.problems[problemId] || {
            status: 'not_started',
            updatedAt: new Date().toISOString(),
          };

        const newBookmarked =
          !existing.isBookmarked;

        if (newBookmarked) {
          addToast({
            title: 'Saved to Bookmarks 🔖',
            description:
              problemName ||
              'Problem bookmarked for later revision.',
            type: 'info',
          });
        }

        return {
          ...previous,
          problems: {
            ...previous.problems,
            [problemId]: {
              ...existing,
              isBookmarked: newBookmarked,
              updatedAt:
                new Date().toISOString(),
            },
          },
          lastActive:
            new Date().toISOString(),
        };
      });
    },
    [addToast]
  );

  // -------------------------------------------------------------------------
  // Save notes
  // -------------------------------------------------------------------------

  const saveNotes = useCallback(
    (
      problemId: number,
      notes: string
    ) => {
      setProgressState((previous) => {
        const existing =
          previous.problems[problemId] || {
            status: 'not_started',
            updatedAt: new Date().toISOString(),
          };

        return {
          ...previous,
          problems: {
            ...previous.problems,
            [problemId]: {
              ...existing,
              notes,
              updatedAt:
                new Date().toISOString(),
            },
          },
          lastActive:
            new Date().toISOString(),
        };
      });

      addToast({
        title: 'Notes Saved',
        description:
          'Your notes have been saved locally.',
        type: 'info',
      });
    },
    [addToast]
  );

  // -------------------------------------------------------------------------
  // Total solved
  // -------------------------------------------------------------------------

  const getTotalSolvedCount =
    useCallback((): number => {
      return Object.values(
        progressState.problems
      ).filter(
        (problem) =>
          problem.status === 'solved'
      ).length;
    }, [progressState]);

  // -------------------------------------------------------------------------
  // Total attempted
  // -------------------------------------------------------------------------

  const getTotalAttemptedCount =
    useCallback((): number => {
      return Object.values(
        progressState.problems
      ).filter(
        (problem) =>
          problem.status === 'attempted'
      ).length;
    }, [progressState]);

  // -------------------------------------------------------------------------
  // Reset local progress
  // -------------------------------------------------------------------------

  const resetAllProgress = useCallback(async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    /*
     * Guest users:
     * Only local progress exists, so clear the guest namespace.
     */
    if (!session?.access_token) {
      setProgressState({
        problems: {},
        lastActive: new Date().toISOString(),
      });

      addToast({
        title: 'Progress Reset',
        description: 'Your local progress has been cleared.',
        type: 'warning',
      });

      return;
    }

    /*
     * Authenticated users:
     * Backend is the source of truth.
     * Delete progress from PostgreSQL first.
     */
    await api.resetAllProgress();

    /*
     * Only clear local state after backend deletion succeeds.
     */
    if (mountedRef.current) {
      setProgressState({
        problems: {},
        lastActive: new Date().toISOString(),
      });
    }

    addToast({
      title: 'Progress Reset',
      description: 'Your synced progress has been cleared.',
      type: 'warning',
    });
  } catch (error) {
    console.error('Failed to reset progress:', error);

    /*
     * Do NOT clear local state if backend reset failed.
     * This prevents apparent data loss during a network/server failure.
     */
    addToast({
      title: 'Reset Failed',
      description:
        'We could not reset your synced progress. Your existing progress has been preserved.',
      type: 'warning',
    });
  }
}, [addToast]);

  // -------------------------------------------------------------------------
  // Provider
  // -------------------------------------------------------------------------

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
  const context =
    useContext(ProgressContext);

  if (!context) {
    throw new Error(
      'useProgress must be used within a ProgressProvider'
    );
  }

  return context;
};