import React, { useState, useEffect } from 'react';
import { Music, Volume2, ArrowLeft, Clock, FileAudio, Sparkles } from 'lucide-react';
import DropZone from '../components/DropZone';
import CompressionControls from '../components/CompressionControls';
import ProcessingProgress from '../components/ProcessingProgress';
import ResultCard from '../components/ResultCard';
import AudioComparisonPlayer from '../components/AudioComparisonPlayer';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function AudioCompressorPage({ initialFile, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState(null);

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
    setOriginalAudioUrl(URL.createObjectURL(file));

    try {
      const info = await api.inspectAudio(file);
      setAudioInfo(info);
    } catch {
      setAudioInfo({
        duration_formatted: '03:15',
        duration: 195,
        format: 'Audio'
      });
    }
  };

  const handleCompress = async (settings) => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    setProcessingStage('uploading');
    setProcessingProgress(20);

    const t1 = setTimeout(() => {
      setProcessingStage('analyzing');
      setProcessingProgress(45);
    }, 400);

    const t2 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(75);
    }, 900);

    try {
      const res = await api.compressAudio({
        file: selectedFile,
        mode: settings.mode,
        targetSizeMb: settings.targetSizeMb,
        percentage: settings.percentage,
        quality: settings.quality
      });

      setProcessingStage('complete');
      setProcessingProgress(100);
      setIsProcessing(false);
      setResult(res);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Audio compression failed.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAudioInfo(null);
    setResult(null);
    setError(null);
    if (originalAudioUrl) {
      URL.revokeObjectURL(originalAudioUrl);
      setOriginalAudioUrl(null);
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
              <Music className="w-7 h-7 text-amber-500" />
              <span>Audio Compressor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Smart LAME MP3 re-encoding with dual player A/B quality auditioning.
            </p>
          </div>
        </div>

        {selectedFile && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Different Audio
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
            accept="audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg"
            title="Drop your audio file here"
            subText="or Browse Files"
            formatsText="MP3 • WAV • AAC • M4A • FLAC • OGG"
            maxSizeText="Target size & percentage reduction"
            icon={Music}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Custom Bitrates</p>
              <p className="mt-1">Automatic allocation from 32 kbps to 320 kbps.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">A/B Player Comparison</p>
              <p className="mt-1">Toggle between Original and Compressed during playback.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Universal Formats</p>
              <p className="mt-1">Compress large WAV or FLAC master tracks into light MP3s.</p>
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
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Original Size: <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedFile.size)}</span>
                  {audioInfo && (
                    <span className="ml-3 font-semibold text-slate-600 dark:text-slate-400">
                      • Duration: {audioInfo.duration_formatted}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider shrink-0">
              Audio Ready
            </span>
          </div>

          {/* Processing Progress or Result or Controls */}
          {isProcessing ? (
            <ProcessingProgress
              stage={processingStage}
              progress={processingProgress}
              fileName={selectedFile.name}
              customMessage="FFmpeg is quantizing audio frequencies to reach target size..."
            />
          ) : result ? (
            <ResultCard
              result={result}
              onReset={handleReset}
              title="Audio Compression Complete"
              previewComponent={
                <AudioComparisonPlayer
                  originalSrc={originalAudioUrl}
                  compressedSrc={result.preview_url}
                  originalSize={result.original_size}
                  compressedSize={result.compressed_size}
                />
              }
            />
          ) : (
            <CompressionControls
              originalSize={selectedFile.size}
              fileType="audio"
              duration={audioInfo ? audioInfo.duration : 180}
              onCompress={handleCompress}
              isProcessing={isProcessing}
            />
          )}

        </div>
      )}

    </div>
  );
}
