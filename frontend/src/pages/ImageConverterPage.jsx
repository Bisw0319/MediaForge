import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, ArrowLeft, Download, RotateCcw, Check, Sparkles } from 'lucide-react';
import DropZone from '../components/DropZone';
import { api, getApiAssetUrl, downloadFile } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function ImageConverterPage({ onBack, initialFile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [targetFormat, setTargetFormat] = useState('WEBP');
  const [quality, setQuality] = useState(90);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const supportedFormats = [
    { id: 'WEBP', label: 'WEBP (High Efficiency)', badge: 'Recommended' },
    { id: 'PNG', label: 'PNG (Lossless Transparency)' },
    { id: 'JPG', label: 'JPG (Universal Photo Standard)' },
    { id: 'BMP', label: 'BMP (Uncompressed Bitmap)' },
  ];

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

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await api.convertImage({
        file: selectedFile,
        targetFormat,
        quality
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Image conversion failed.');
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
              <RefreshCw className="w-7 h-7 text-indigo-500" />
              <span>Image Converter</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Convert seamlessly between JPG, PNG, WEBP, and BMP with alpha preservation.
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
            title="Drop image to convert"
            subText="or Browse Files"
            formatsText="JPG • PNG • WEBP • BMP"
            maxSizeText="Instant Cross-Format Transcoding"
            icon={RefreshCw}
          />
        </div>
      )}

      {/* Convert Workspace */}
      {selectedFile && (
        <div className="space-y-8">
          
          {/* File Card */}
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
                  Size: <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedFile.size)}</span>
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider shrink-0">
              Ready
            </span>
          </div>

          {/* Controls or Result */}
          {result ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Conversion Complete</span>
                </h3>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  {result.original_format} → {result.target_format}
                </span>
              </div>

              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-4 max-h-96">
                <img
                  src={getApiAssetUrl(result.preview_url)}
                  alt="Converted preview"
                  className="max-h-80 object-contain rounded-lg"
                />
              </div>

              {/* Metrics & Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500">
                  Original: {result.original_size_formatted} → 
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">
                    Converted: {result.new_size_formatted}
                  </span>
                </p>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                  >
                    Convert to Another Format
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(result.download_url, result.filename)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-600/30 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.target_format}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Target Format Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Convert To
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supportedFormats.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTargetFormat(f.id)}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        targetFormat === f.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="font-extrabold text-sm">{f.id}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{f.label}</span>
                      </div>
                      {targetFormat === f.id && <Check className="w-4 h-4 text-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider for Lossy targets */}
              {['WEBP', 'JPG'].includes(targetFormat) && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Export Quality Level</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{isProcessing ? 'Converting Image...' : `Convert to ${targetFormat}`}</span>
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
