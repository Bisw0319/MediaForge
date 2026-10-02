import React, { useState } from 'react';
import { Film, RefreshCw, ArrowLeft, Download, Check, Sparkles, Loader2 } from 'lucide-react';
import DropZone from '../components/DropZone';
import VideoPreviewPlayer from '../components/VideoPreviewPlayer';
import ProcessingProgress from '../components/ProcessingProgress';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function VideoConverterPage({ onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('MP4');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('uploading');
  const [processingProgress, setProcessingProgress] = useState(0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const videoFormats = [
    { id: 'MP4', label: 'Universal H.264 (Most Compatible)', badge: 'Recommended' },
    { id: 'WEBM', label: 'VP9 Web Video (Open Standard)' },
    { id: 'MOV', label: 'Apple QuickTime Movie' },
    { id: 'MKV', label: 'Matroska Media Container' },
    { id: 'AVI', label: 'Audio Video Interleave' },
    { id: 'GIF', label: 'Animated GIF (First 15s Clip)' },
  ];

  const handleFileSelected = (file) => {
    const f = Array.isArray(file) ? file[0] : file;
    setSelectedFile(f);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    setProcessingStage('uploading');
    setProcessingProgress(25);

    const t1 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(60);
    }, 600);

    const t2 = setTimeout(() => {
      setProcessingStage('optimizing');
      setProcessingProgress(88);
    }, 1500);

    try {
      const res = await api.convertVideo({
        file: selectedFile,
        targetFormat
      });
      setProcessingStage('complete');
      setProcessingProgress(100);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Video conversion failed. Ensure source format is supported.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
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
              <RefreshCw className="w-7 h-7 text-pink-500" />
              <span>Video Converter</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Convert between MP4, WEBM, and animated GIF using hardware-accelerated FFmpeg.
            </p>
          </div>
        </div>

        {selectedFile && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Different Video
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
            accept="video/*,.mp4,.mov,.webm,.mkv,.avi"
            title="Drop video to convert"
            subText="or Browse Files"
            formatsText="MP4 • MOV • WEBM • MKV • AVI"
            maxSizeText="Direct Format Transcoding"
            icon={Film}
          />
        </div>
      )}

      {/* Convert Workspace */}
      {selectedFile && (
        <div className="space-y-8">
          
          {/* File Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4 truncate">
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Size: <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedFile.size)}</span>
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider shrink-0">
              Ready
            </span>
          </div>

              {/* Controls or Result */}
          {isProcessing ? (
            <ProcessingProgress
              stage={processingStage}
              progress={processingProgress}
              fileName={selectedFile.name}
              customMessage={`Transcoding video stream into ${targetFormat} using FFmpeg with hardware acceleration...`}
            />
          ) : result ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Video Converted to {result.target_format}</span>
                </h3>
              </div>

              {/* Preview */}
              {result.target_format === 'GIF' ? (
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-4 max-h-96">
                  <img
                    src={result.preview_url}
                    alt="GIF preview"
                    className="max-h-80 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <VideoPreviewPlayer
                  videoSrc={result.preview_url}
                  originalSize={result.original_size}
                  compressedSize={result.new_size}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-500">
                  Original: {result.original_size_formatted} → 
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">
                    Output: {result.new_size_formatted}
                  </span>
                </p>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Convert Another Format
                  </button>
                  <a
                    href={result.download_url}
                    download={result.filename}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {result.target_format}</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Target Format Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Convert Video To
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {videoFormats.map((f) => (
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
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-extrabold text-sm">{f.id}</p>
                          {f.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.label}</p>
                      </div>
                      {targetFormat === f.id && <Check className="w-4 h-4 text-brand-500 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Convert to {targetFormat}</span>
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
