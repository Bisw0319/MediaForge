import React, { useState, useEffect } from 'react';
import { Sliders, Target, Percent, Sparkles, ChevronDown, ChevronUp, Zap, HelpCircle } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function CompressionControls({
  originalSize,
  fileType = 'image',
  duration = 0,
  onCompress,
  isProcessing = false,
  customModes = ['target_size', 'percentage', 'quality'],
  extraAdvancedFields = null
}) {
  const [mode, setMode] = useState('target_size'); // target_size | percentage | quality

  // Mode 1: Target Size
  const defaultTargetMb = Math.max(0.1, parseFloat((originalSize / (1024 * 1024) * 0.4).toFixed(1)));
  const [targetSizeMb, setTargetSizeMb] = useState(defaultTargetMb);

  // Mode 2: Percentage reduction
  const [percentage, setPercentage] = useState(60); // 60% reduction

  // Mode 3: Quality
  const [quality, setQuality] = useState(75);

  // Advanced options toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [outputFormat, setOutputFormat] = useState('AUTO');

  // Estimate state
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [estimatedReduction, setEstimatedReduction] = useState(0);

  // Calculate live estimate whenever inputs change
  useEffect(() => {
    let est = originalSize;
    if (mode === 'target_size') {
      const targetBytes = (parseFloat(targetSizeMb) || 1) * 1024 * 1024;
      // Clamp to reasonable estimate
      est = Math.min(originalSize, Math.max(10 * 1024, targetBytes));
    } else if (mode === 'percentage') {
      const pct = Math.max(5, Math.min(95, percentage));
      est = originalSize * (1 - pct / 100);
    } else if (mode === 'quality') {
      const q = Math.max(10, Math.min(100, quality));
      const ratio = 0.15 + (q / 100) * 0.75;
      est = originalSize * ratio;
    }

    setEstimatedSize(est);
    const saved = Math.max(0, originalSize - est);
    setEstimatedReduction(Math.round((saved / originalSize) * 100));
  }, [mode, targetSizeMb, percentage, quality, originalSize]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCompress({
      mode,
      targetSizeMb: mode === 'target_size' ? parseFloat(targetSizeMb) : undefined,
      percentage: mode === 'percentage' ? parseFloat(percentage) : undefined,
      quality: mode === 'quality' ? parseInt(quality) : undefined,
      outputFormat: outputFormat !== 'AUTO' ? outputFormat : undefined
    });
  };

  const origMb = (originalSize / (1024 * 1024)).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Custom Compression Settings</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            You choose how small you want the file. MediaForge optimizes it for you.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Original Size:</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatBytes(originalSize)}</span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode('target_size')}
          className={`py-2 px-1 sm:px-3 rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all ${
            mode === 'target_size'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Target Size</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('percentage')}
          className={`py-2 px-1 sm:px-3 rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all ${
            mode === 'percentage'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Percentage</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('quality')}
          className={`py-2 px-1 sm:px-3 rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all ${
            mode === 'quality'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Quality<span className="hidden sm:inline"> Slider</span></span>
        </button>
      </div>

      {/* Mode 1: Target Size */}
      {mode === 'target_size' && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Desired Output Size (in Megabytes)
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0.05"
                  max={(originalSize / (1024 * 1024)).toFixed(1)}
                  step="0.1"
                  value={targetSizeMb}
                  onChange={(e) => setTargetSizeMb(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="e.g. 2.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  MB
                </span>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Quick Target Suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {[0.5, 1, 2, 5, 10].map((preset) => {
                if (preset >= originalSize / (1024 * 1024)) return null;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTargetSizeMb(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      parseFloat(targetSizeMb) === preset
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {preset} MB
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setTargetSizeMb(parseFloat((originalSize / (1024 * 1024) * 0.5).toFixed(1)))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300"
              >
                50% of Original ({formatBytes(originalSize * 0.5)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Percentage */}
      {mode === 'percentage' && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Reduction Amount
            </label>
            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
              Reduce by {percentage}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Light (10%)</span>
            <span>Balanced (50%)</span>
            <span>Maximum (90%)</span>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[30, 50, 70, 85].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercentage(pct)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  percentage === pct
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Reduce by {pct}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Quality */}
      {mode === 'quality' && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Visual Quality Level
            </label>
            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
              {quality}%
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="95"
            step="5"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Smaller File</span>
            <span>Balanced</span>
            <span>Better Quality</span>
          </div>
        </div>
      )}

      {/* Live Estimation Card */}
      <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Estimated Calculation</span>
          <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>~{estimatedReduction}% reduction</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Original</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatBytes(originalSize)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">
              {mode === 'target_size' ? 'Target' : 'Mode'}
            </p>
            <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
              {mode === 'target_size' ? `${targetSizeMb} MB` : mode === 'percentage' ? `-${percentage}%` : `${quality}% Quality`}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Estimated Output</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ~{formatBytes(estimatedSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Options Collapsible */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1"
        >
          <span>Advanced Options</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-4 animate-fadeIn text-xs">
            {fileType === 'image' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value="AUTO">Keep Original Format</option>
                  <option value="WEBP">Modern WEBP (Best compression)</option>
                  <option value="JPEG">Standard JPEG</option>
                  <option value="PNG">Lossless PNG</option>
                </select>
              </div>
            )}

            {extraAdvancedFields}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Default automated profile uses intelligent 2-pass rate control and perceptual quantization for optimal balance.
            </p>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={handleSubmit}
        className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
          isProcessing
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        <Zap className="w-5 h-5" />
        <span>{isProcessing ? 'Optimizing Media...' : 'Compress Now'}</span>
      </button>

    </div>
  );
}
