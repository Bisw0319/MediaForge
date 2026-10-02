import React, { useEffect } from 'react';
import { CheckCircle2, Download, Eye, RotateCcw, Sparkles, AlertCircle, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../utils/formatters';

export default function ResultCard({
  result,
  onReset,
  previewComponent = null,
  title = "Compression Complete"
}) {
  useEffect(() => {
    // Fire celebratory confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore in environments without canvas
    }
  }, []);

  const handleDownload = () => {
    if (result.download_url) {
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename || 'compressed-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.original_filename || result.filename}
            </p>
          </div>
        </div>

        {result.reduction_percent > 0 && (
          <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-sm font-bold self-start sm:self-auto">
            <Sparkles className="w-4 h-4" />
            <span>{result.reduction_percent}% Smaller</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">Original Size</p>
          <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">
            {result.original_size_formatted || formatBytes(result.original_size)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">Optimized Size</p>
          <p className="text-base sm:text-lg font-extrabold text-brand-600 dark:text-brand-400 mt-1">
            {result.compressed_size_formatted || result.output_size_formatted || formatBytes(result.compressed_size || result.output_size)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">Space Saved</p>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {result.saved_formatted || formatBytes(result.saved_bytes || 0)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase font-semibold">Reduction</p>
          <p className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {result.reduction_percent || 0}%
          </p>
        </div>
      </div>

      {/* Warning/Note if closest practical size */}
      {result.note && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.note}</span>
        </div>
      )}

      {/* Media Preview Section (Before/After Slider, Video Player, Audio Player, PDF info) */}
      {previewComponent && (
        <div className="pt-2">
          {previewComponent}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Optimize Another File</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-600/30 hover:shadow-brand-600/50 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          <span>Download Result</span>
        </button>
      </div>

    </div>
  );
}
