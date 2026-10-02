import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, FileArchive, Download, Trash2, FileImage } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function BatchList({
  files,
  results,
  isProcessing,
  onCompressAll,
  onDownloadZip,
  onClear,
  downloadZipUrl
}) {
  const totalOriginal = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileImage className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>{files.length} Files Selected for Batch Optimization</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total Combined Size: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(totalOriginal)}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!isProcessing && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          {downloadZipUrl && (
            <button
              type="button"
              onClick={onDownloadZip}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/30 transition-all"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download All as ZIP</span>
            </button>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {files.map((f, idx) => {
          const res = results[idx];
          const isDone = res && res.success;
          const isError = res && res.error;
          const isCurrent = isProcessing && !res && idx === results.length;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs"
            >
              <div className="flex items-center space-x-3 truncate mr-3">
                <span className="font-mono text-slate-400 text-[11px] w-4">{idx + 1}.</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                <span className="text-slate-400 text-[11px] shrink-0">({formatBytes(f.size)})</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {isDone ? (
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{formatBytes(res.compressed_size)} (-{res.reduction_percent}%)</span>
                  </div>
                ) : isCurrent ? (
                  <div className="flex items-center space-x-1.5 text-brand-600 dark:text-brand-400 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center space-x-1.5 text-red-500 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Queued</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Batch Action */}
      {!downloadZipUrl && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={onCompressAll}
          className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
            isProcessing
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing {files.length} Files...</span>
            </>
          ) : (
            <>
              <span>Compress All ({files.length} Files)</span>
            </>
          )}
        </button>
      )}

    </div>
  );
}
