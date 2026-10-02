import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, CheckCircle2, Sliders, Zap, ShieldCheck } from 'lucide-react';
import DropZone from '../components/DropZone';
import ProcessingProgress from '../components/ProcessingProgress';
import ResultCard from '../components/ResultCard';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function PdfCompressorPage({ initialFile, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [mode, setMode] = useState('recommended'); // 'recommended' | 'maximum' | 'custom'
  const [targetSizeMb, setTargetSizeMb] = useState(2.0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('uploading');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialFile) {
      const file = Array.isArray(initialFile) ? initialFile[0] : initialFile;
      handleFileSelected(file);
    }
  }, [initialFile]);

  const handleFileSelected = async (file) => {
    setError(null);
    setResult(null);
    setSelectedFile(file);

    const defaultTarget = Math.max(0.5, parseFloat((file.size / (1024 * 1024) * 0.4).toFixed(1)));
    setTargetSizeMb(defaultTarget);

    try {
      const info = await api.inspectPdf(file);
      setPdfInfo(info);
    } catch {
      setPdfInfo({ page_count: 1 });
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    setProcessingStage('uploading');
    setProcessingProgress(25);

    const t1 = setTimeout(() => {
      setProcessingStage('analyzing');
      setProcessingProgress(55);
    }, 400);

    const t2 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(80);
    }, 900);

    try {
      const res = await api.compressPdf({
        file: selectedFile,
        mode,
        targetSizeMb: mode === 'custom' ? parseFloat(targetSizeMb) : undefined
      });

      setProcessingStage('complete');
      setProcessingProgress(100);
      setIsProcessing(false);
      setResult(res);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'PDF compression failed. Please try a different option.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPdfInfo(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <FileText className="w-7 h-7 text-red-600 dark:text-red-400" />
              <span>PDF Compressor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Reduce document size for emailing and fast web viewing while keeping text sharp.
            </p>
          </div>
        </div>

        {selectedFile && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Different PDF
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      {!selectedFile && (
        <div className="space-y-4">
          <DropZone
            onFilesSelected={handleFileSelected}
            accept="application/pdf,.pdf"
            title="Drop your PDF document here"
            subText="or Browse Files"
            formatsText="PDF Documents & Reports"
            maxSizeText="Stream Deflation & Image Downsampling"
            icon={FileText}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Recommended</p>
              <p className="mt-1">Balanced quality and size for everyday emails.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Maximum Compression</p>
              <p className="mt-1">Aggressive stream deflation for strict size limits.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Custom Target Size</p>
              <p className="mt-1">Specify your exact MB ceiling.</p>
            </div>
          </div>
        </div>
      )}

      {/* File Loaded Workspace */}
      {selectedFile && (
        <div className="space-y-8">
          
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4 truncate">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Original Size: <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedFile.size)}</span>
                  {pdfInfo && (
                    <span className="ml-3 font-semibold text-slate-600 dark:text-slate-400">
                      • {pdfInfo.page_count} {pdfInfo.page_count === 1 ? 'Page' : 'Pages'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider shrink-0">
              PDF Loaded
            </span>
          </div>

          {/* Processing Progress or Result or Controls */}
          {isProcessing ? (
            <ProcessingProgress
              stage={processingStage}
              progress={processingProgress}
              fileName={selectedFile.name}
              customMessage="Deflating streams, optimizing fonts, and re-encoding embedded images..."
            />
          ) : result ? (
            <ResultCard
              result={result}
              onReset={handleReset}
              title="PDF Compression Complete"
              previewComponent={
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Optimized Document ({result.page_count} Pages)
                    </span>
                  </div>
                  <a
                    href={result.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Open PDF in New Tab ↗
                  </a>
                </div>
              }
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-red-500" />
                  <span>Choose PDF Compression Level</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a balance between file reduction and document image clarity.
                </p>
              </div>

              {/* 3 Compression Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Option 1: Recommended */}
                <div
                  onClick={() => setMode('recommended')}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    mode === 'recommended'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Recommended</span>
                    {mode === 'recommended' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Balanced quality and size. Ideal for reports, business forms, and emailing.
                  </p>
                </div>

                {/* Option 2: Maximum */}
                <div
                  onClick={() => setMode('maximum')}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    mode === 'maximum'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Maximum</span>
                    {mode === 'maximum' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Smallest practical file. Heavy image downsampling for tight portal uploads.
                  </p>
                </div>

                {/* Option 3: Custom */}
                <div
                  onClick={() => setMode('custom')}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    mode === 'custom'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Custom Target</span>
                    {mode === 'custom' && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Specify exact target size in MB for custom portals and forms.
                  </p>
                </div>

              </div>

              {/* Custom Target Input */}
              {mode === 'custom' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Desired PDF Size (Megabytes)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0.1"
                      max={(selectedFile.size / (1024 * 1024)).toFixed(1)}
                      step="0.1"
                      value={targetSizeMb}
                      onChange={(e) => setTargetSizeMb(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm w-48 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-400">MB</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleCompress}
                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5" />
                <span>Compress PDF Now</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
