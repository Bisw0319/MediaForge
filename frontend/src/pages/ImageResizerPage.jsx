import React, { useState, useEffect } from 'react';
import { Maximize2, Lock, Unlock, ArrowLeft, Download, RotateCcw, Check, Sparkles } from 'lucide-react';
import DropZone from '../components/DropZone';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function ImageResizerPage({ onBack, initialFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [origDimensions, setOrigDimensions] = useState({ width: 1920, height: 1080 });

  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [activePreset, setActivePreset] = useState('custom');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presets = [
    { id: 'passport_photo', label: 'Passport Photo (3.5 × 4.5 cm)', w: 413, h: 531, iconText: '3.5×4.5 cm' },
    { id: 'passport_2x2', label: 'Passport Photo (2 × 2 in)', w: 600, h: 600, iconText: '2×2 in' },
    { id: 'instagram_post', label: 'Instagram Post', w: 1080, h: 1080, iconText: '1:1' },
    { id: 'instagram_story', label: 'Instagram Story', w: 1080, h: 1920, iconText: '9:16' },
    { id: 'youtube_thumbnail', label: 'YouTube Thumbnail', w: 1280, h: 720, iconText: '16:9' },
    { id: 'twitter_header', label: 'Twitter/X Header', w: 1500, h: 500, iconText: '3:1' },
    { id: 'linkedin_banner', label: 'LinkedIn Banner', w: 1584, h: 396, iconText: '4:1' },
    { id: 'facebook_cover', label: 'Facebook Cover', w: 820, h: 312, iconText: '16:6' },
    { id: 'custom', label: 'Custom Dimensions', w: null, h: null, iconText: 'Custom' },
  ];

  const handleFileSelected = (file) => {
    const f = Array.isArray(file) ? file[0] : file;
    if (!f) return;
    setSelectedFile(f);
    setResult(null);
    setError(null);

    // Reuse a single object URL and revoke previous to prevent memory leaks
    setOriginalUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      const newUrl = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = newUrl;
      return newUrl;
    });
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

  const handleWidthChange = (val) => {
    const w = parseInt(val) || 0;
    setWidth(w);
    setActivePreset('custom');
    if (lockAspectRatio && origDimensions.width > 0) {
      const ratio = origDimensions.height / origDimensions.width;
      setHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (val) => {
    const h = parseInt(val) || 0;
    setHeight(h);
    setActivePreset('custom');
    if (lockAspectRatio && origDimensions.height > 0) {
      const ratio = origDimensions.width / origDimensions.height;
      setWidth(Math.round(h * ratio));
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    if (preset.w && preset.h) {
      setWidth(preset.w);
      setHeight(preset.h);
      setLockAspectRatio(false); // Presets define fixed targets
    }
  };

  const handleResize = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await api.resizeImage({
        file: selectedFile,
        width: parseInt(width),
        height: parseInt(height),
        lockAspectRatio,
        preset: activePreset !== 'custom' ? activePreset : undefined
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Image resizing failed.');
    } finally {
      setIsProcessing(false);
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
              <Maximize2 className="w-7 h-7 text-sky-500" />
              <span>Image Resizer</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Resize images to exact dimensions or social media standards using Lanczos filtering.
            </p>
          </div>
        </div>

        {selectedFile && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Different Photo
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
            accept="image/*"
            title="Drop image to resize"
            subText="or Browse Files"
            formatsText="JPG • PNG • WEBP • Social Media Presets"
            maxSizeText="Exact Dimensions & Aspect Ratio Lock"
            icon={Maximize2}
          />
        </div>
      )}

      {/* Resize Workspace */}
      {selectedFile && (
        <div className="space-y-8">
          
          {/* File Overview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4 truncate">
              {originalUrl && (
                <img
                  src={originalUrl}
                  alt="Original"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              )}
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Current Dimensions: <span className="font-bold text-slate-800 dark:text-slate-200">{origDimensions.width} × {origDimensions.height} px</span>
                  <span className="ml-2">({formatBytes(selectedFile.size)})</span>
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-xs font-bold shrink-0">
              Ready to Resize
            </span>
          </div>

          {/* Controls or Result */}
          {result ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Resizing Complete</span>
                </h3>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {result.new_width} × {result.new_height} px
                </span>
              </div>

              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-4 max-h-96">
                <img
                  src={result.preview_url}
                  alt="Resized preview"
                  className="max-h-80 object-contain rounded-lg"
                />
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500">
                  Original: {result.original_width}×{result.original_height} ({result.original_size_formatted}) → 
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">
                    {result.new_width}×{result.new_height} ({result.new_size_formatted})
                  </span>
                </p>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                  >
                    Adjust Dimensions
                  </button>
                  <a
                    href={result.download_url}
                    download={result.filename}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Resized Image</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Social Media & Standard Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activePreset === p.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{p.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {p.w && p.h ? `${p.w} × ${p.h}` : 'Manual'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Dimension Inputs */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Exact Pixel Dimensions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Aspect ratio lock toggle */}
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {lockAspectRatio ? (
                      <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Lock Aspect Ratio</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleResize}
                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <Maximize2 className="w-5 h-5" />
                <span>{isProcessing ? 'Resizing...' : 'Resize Image Now'}</span>
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
