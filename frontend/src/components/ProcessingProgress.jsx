import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';

export default function ProcessingProgress({
  stage = 'compressing', // 'uploading' | 'analyzing' | 'compressing' | 'optimizing' | 'complete'
  progress = 50,
  fileName = 'file',
  customMessage = null
}) {
  const stages = [
    { id: 'uploading', label: 'Uploading' },
    { id: 'analyzing', label: 'Analyzing file' },
    { id: 'compressing', label: 'Compressing' },
    { id: 'optimizing', label: 'Optimizing' },
    { id: 'complete', label: 'Complete' },
  ];

  const getStageIndex = (s) => stages.findIndex((item) => item.id === s);
  const currentIdx = getStageIndex(stage);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 animate-fadeIn">
      
      {/* File & Status Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
            Optimization In Progress
          </p>
          <h4 className="font-bold text-slate-900 dark:text-white text-base truncate max-w-xs sm:max-w-md">
            {fileName}
          </h4>
        </div>

        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{progress}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-brand-600 to-sky-400 h-full rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>

      {/* Stages Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {stages.map((st, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={st.id}
              className={`flex items-center space-x-2 p-2 rounded-lg text-xs font-semibold transition-colors ${
                isDone
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isCurrent
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin text-brand-600" />
              ) : (
                <Circle className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Context info */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        {customMessage || "MediaForge is crunching data on dedicated backend processors. This only takes a moment..."}
      </p>

    </div>
  );
}
