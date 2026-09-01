import React, { useState } from 'react';
import { X, Target, CheckSquare, Square, Loader2, Play } from 'lucide-react';
import { api } from '../../services/api';
import type { PrepSetResponse } from '../../types';

interface PreparationModeModalProps {
  companyName: string;
  companySlug: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (prepSet: PrepSetResponse) => void;
}

export const PreparationModeModal: React.FC<PreparationModeModalProps> = ({
  companyName,
  companySlug,
  isOpen,
  onClose,
  onGenerated,
}) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['Easy', 'Medium', 'Hard']);
  const [problemCount, setProblemCount] = useState<number>(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff)
        ? prev.filter((d) => d !== diff)
        : [...prev, diff]
    );
  };

  const handleGenerate = async () => {
    if (selectedDifficulties.length === 0) {
      setError('Please select at least one difficulty level.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const diffParam = selectedDifficulties.join(',');
      const res = await api.getPreparationSet({
        company: companySlug,
        difficulty: diffParam,
        count: problemCount,
      });

      onGenerated(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate preparation set.');
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const countOptions = [
    { label: '10 Problems (Quick Warmup)', value: 10 },
    { label: '25 Problems (Standard Prep)', value: 25 },
    { label: '50 Problems (Intensive Marathon)', value: 50 },
    { label: 'All Matching Problems', value: 200 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-r from-brand-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {companyName} Preparation Mode
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">
                  Sprint
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Generate a laser-focused custom problem set from verified questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Difficulties selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5">
              1. Select Target Difficulties
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {difficultyOptions.map((diff) => {
                const isSelected = selectedDifficulties.includes(diff);
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => toggleDifficulty(diff)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? diff === 'Easy'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-sm'
                          : diff === 'Medium'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-sm'
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{diff}</span>
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Count selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5">
              2. Choose Problem Set Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {countOptions.map((opt) => {
                const isSelected = problemCount === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProblemCount(opt.value)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/70 text-brand-800 dark:text-brand-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isSelected ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Problem Set...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Generate {problemCount} Problems
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
