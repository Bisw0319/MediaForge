import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  RotateCcw,
  Palette,
  ArrowLeft,
  Loader2,
  Check,
  User,
  Box,
  ShieldCheck,
  Zap
} from 'lucide-react';
import DropZone from '../components/DropZone';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { api, getApiAssetUrl, downloadFile } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function BackgroundRemoverPage({ onBack, initialFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageText, setStageText] = useState('Detecting subject...');

  // Subject model mode: 'human' (person/portrait) vs 'general' (object/product)
  const [modelType, setModelType] = useState('human');

  // Replacement background options
  const [bgType, setBgType] = useState('transparent'); // 'transparent', 'white', 'black', 'custom_color', 'gradient'
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [gradientTheme, setGradientTheme] = useState('sunset'); // 'sunset', 'ocean', 'slate', 'emerald', 'purple'

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = (file) => {
    const f = Array.isArray(file) ? file[0] : file;
    if (!f) return;
    setSelectedFile(f);
    setResult(null);
    setError(null);
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    // Automatically trigger initial removal with selected model
    runRemoval(f, 'transparent', null, null, modelType);
  };

  useEffect(() => {
    if (initialFile) {
      handleFileSelected(initialFile);
    }
    return () => {
      setOriginalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [initialFile]);

  const runRemoval = async (fileToProcess, chosenBgType, color, grad, chosenModel) => {
    const f = fileToProcess || selectedFile;
    if (!f) return;

    const currentModel = chosenModel !== undefined ? chosenModel : modelType;

    setIsProcessing(true);
    setError(null);
    setStageText(
      currentModel === 'human'
        ? 'Detecting body contours & extremities...'
        : 'Detecting object edges & contours...'
    );

    const t1 = setTimeout(() => {
      setStageText('Applying 100% full-resolution lossless alpha mask...');
    }, 800);

    try {
      const res = await api.removeBackground({
        file: f,
        bgType: chosenBgType || bgType,
        customColor: color || customColor,
        gradientTheme: grad || gradientTheme,
        modelType: currentModel
      });

      setResult(res);
    } catch (err) {
      setError(err.message || 'Background removal failed. Please check the image format.');
    } finally {
      clearTimeout(t1);
      setIsProcessing(false);
    }
  };

  const handleModelChange = (newModel) => {
    setModelType(newModel);
    if (selectedFile) {
      runRemoval(selectedFile, bgType, customColor, gradientTheme, newModel);
    }
  };

  const handleBackgroundChange = (newBgType, color = customColor, grad = gradientTheme) => {
    setBgType(newBgType);
    if (color) setCustomColor(color);
    if (grad) setGradientTheme(grad);
    if (selectedFile) {
      runRemoval(selectedFile, newBgType, color, grad, modelType);
    }
  };

  const handleDownload = () => {
    if (result && result.download_url) {
      downloadFile(result.download_url, result.filename || 'mediaforge_cutout.png');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
      setOriginalUrl(null);
    }
  };

  const colorPresets = [
    { name: 'Sky Blue', hex: '#38bdf8' },
    { name: 'Studio Grey', hex: '#f1f5f9' },
    { name: 'Charcoal', hex: '#1e293b' },
    { name: 'Pastel Rose', hex: '#fda4af' },
    { name: 'Vibrant Green', hex: '#10b981' },
    { name: 'Royal Violet', hex: '#8b5cf6' },
  ];

  const gradients = [
    { id: 'sunset', label: 'Sunset', css: 'from-rose-500 to-amber-400' },
    { id: 'ocean', label: 'Ocean', css: 'from-cyan-500 to-blue-600' },
    { id: 'slate', label: 'Slate', css: 'from-slate-800 to-slate-950' },
    { id: 'emerald', label: 'Emerald', css: 'from-emerald-400 to-teal-600' },
    { id: 'purple', label: 'Purple', css: 'from-violet-500 to-purple-800' },
  ];

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
              <Scissors className="w-7 h-7 text-emerald-500" />
              <span>Remove Image Background Automatically</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              100% original quality & resolution preserved • No downscaling • Clean body & edge segmentation
            </p>
          </div>
        </div>

        {selectedFile && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Another Photo
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Model / Subject Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Subject Type & Quality Engine
            </span>
          </div>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Lossless 100% Resolution</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModelChange('human')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start space-x-3 ${
              modelType === 'human'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className={`p-2 rounded-lg mt-0.5 ${
              modelType === 'human'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Person / Portrait
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Deep body segmentation. Preserves arms, shoulders, hair, and body sides without clipping.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModelChange('general')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start space-x-3 ${
              modelType === 'general'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className={`p-2 rounded-lg mt-0.5 ${
              modelType === 'general'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              <Box className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Product / General Object
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Crisp boundary detection for e-commerce products, cars, animals, logos, and inanimate objects.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Upload DropZone */}
      {!selectedFile && (
        <div className="space-y-4">
          <DropZone
            onFilesSelected={handleFileSelected}
            accept="image/*"
            title="Drop image to remove background"
            subText="or Browse Photos"
            formatsText="JPG • PNG • WEBP • Portraits, Products, High-Res Photos"
            maxSizeText="Full 100% Original Resolution Guaranteed"
            icon={Scissors}
          />
        </div>
      )}

      {/* Processing State */}
      {selectedFile && isProcessing && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {stageText}
            </h3>
            <p className="text-xs text-slate-400">
              {modelType === 'human'
                ? 'High-precision U2Net Human Seg model is analyzing body contours without clipping...'
                : 'High-precision U2Net neural network is segmenting foreground alpha boundaries...'}
            </p>
          </div>
        </div>
      )}

      {/* Results and Background Customization */}
      {selectedFile && !isProcessing && result && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Before/After Split Viewer */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  AI Cutout Comparison
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{result.width} × {result.height} px (100% Original Resolution)</span>
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {result.original_size_formatted} → {result.output_size_formatted}
              </span>
            </div>

            <BeforeAfterSlider
              beforeSrc={originalUrl}
              afterSrc={getApiAssetUrl(result.preview_url)}
              beforeLabel="Original Image"
              afterLabel="Background Removed"
              isTransparent={bgType === 'transparent'}
            />

            {/* Background Replacement Toolbar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-brand-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Replace Background
                </h4>
              </div>

              {/* Mode Buttons */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleBackgroundChange('transparent')}
                  className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    bgType === 'transparent'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-checkerboard border border-slate-300" />
                  <span>Transparent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBackgroundChange('white')}
                  className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    bgType === 'white'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300" />
                  <span>White</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBackgroundChange('black')}
                  className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    bgType === 'black'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700" />
                  <span>Black</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBackgroundChange('custom_color')}
                  className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    bgType === 'custom_color'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: customColor }} />
                  <span>Custom Color</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBackgroundChange('gradient')}
                  className={`px-3.5 py-2 rounded-xl border flex items-center space-x-2 transition-all ${
                    bgType === 'gradient'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-400" />
                  <span>Gradient</span>
                </button>
              </div>

              {/* Custom Color Swatches & Picker */}
              {bgType === 'custom_color' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 animate-fadeIn">
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleBackgroundChange('custom_color', c.hex)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                        customColor === c.hex ? 'border-brand-500 scale-110 shadow-sm' : 'border-white dark:border-slate-800'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {customColor === c.hex && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  ))}

                  <label className="flex items-center space-x-2 ml-2 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleBackgroundChange('custom_color', e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span>Hex Picker</span>
                  </label>
                </div>
              )}

              {/* Gradient Themes */}
              {bgType === 'gradient' && (
                <div className="flex flex-wrap gap-2 pt-1 animate-fadeIn">
                  {gradients.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleBackgroundChange('gradient', null, g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${g.css} transition-transform hover:scale-105 ${
                        gradientTheme === g.id ? 'ring-2 ring-brand-500 shadow-md scale-105' : 'opacity-80'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Upload Another Image</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Cutout PNG</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
