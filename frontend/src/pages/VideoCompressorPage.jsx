import React, { useState, useEffect } from 'react';
import { Video, Film, ArrowLeft, Clock, Monitor, FileCode, Sparkles } from 'lucide-react';
import DropZone from '../components/DropZone';
import CompressionControls from '../components/CompressionControls';
import ProcessingProgress from '../components/ProcessingProgress';
import ResultCard from '../components/ResultCard';
import VideoPreviewPlayer from '../components/VideoPreviewPlayer';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function VideoCompressorPage({ initialFile, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
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

    try {
      const info = await api.inspectVideo(file);
      setVideoInfo(info);
    } catch (e) {
      // Default fallback info
      setVideoInfo({
        duration_formatted: '01:00',
        duration: 60,
        width: 1920,
        height: 1080,
        video_codec: 'h264'
      });
    }
  };

  const handleCompress = async (settings) => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    // Staged progress timeline for realistic video transcoding feedback
    setProcessingStage('uploading');
    setProcessingProgress(15);

    const t1 = setTimeout(() => {
      setProcessingStage('analyzing');
      setProcessingProgress(35);
    }, 800);

    const t2 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(65);
    }, 2000);

    const t3 = setTimeout(() => {
      setProcessingStage('optimizing');
      setProcessingProgress(88);
    }, 4500);

    try {
      const res = await api.compressVideo({
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
      setError(err.message || 'Video compression encountered an issue. Try selecting a slightly larger target size.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVideoInfo(null);
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
              <Video className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              <span>Video Compressor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Intelligent bitrate and resolution scaling powered by FFmpeg.
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
            title="Drop your video here"
            subText="or Browse Files"
            formatsText="MP4 • MOV • WEBM • MKV • AVI"
            maxSizeText="Target-size compression with auto-resolution downscaling"
            icon={Film}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Exact Target Size</p>
              <p className="mt-1">e.g. 500 MB down to 100 MB with optimal mathematical bitrate.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">No Blocky Artifacts</p>
              <p className="mt-1">Downscales resolution when necessary so frames stay sharp.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">FastStart Web Streaming</p>
              <p className="mt-1">Outputs MP4 files that buffer immediately on web & mobile.</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Loaded Workspace */}
      {selectedFile && (
        <div className="space-y-8">
          
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    File Size: <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(selectedFile.size)}</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold shrink-0">
                Video Loaded
              </span>
            </div>

            {/* Video technical stats */}
            {videoInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Duration</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{videoInfo.duration_formatted || '00:00'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Resolution</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {videoInfo.width && videoInfo.height ? `${videoInfo.width}×${videoInfo.height}` : 'HD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Video Codec</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 uppercase">{videoInfo.video_codec || 'H.264'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Target Engine</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">H.264 + AAC</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Processing Progress or Result or Controls */}
          {isProcessing ? (
            <ProcessingProgress
              stage={processingStage}
              progress={processingProgress}
              fileName={selectedFile.name}
              customMessage="FFmpeg is transcoding video streams with dynamic bitrate allocation..."
            />
          ) : result ? (
            <ResultCard
              result={result}
              onReset={handleReset}
              previewComponent={
                <VideoPreviewPlayer
                  videoSrc={result.preview_url}
                  originalSize={result.original_size}
                  compressedSize={result.compressed_size}
                  resolution={result.resolution}
                  durationFormatted={result.duration_formatted}
                />
              }
            />
          ) : (
            <CompressionControls
              originalSize={selectedFile.size}
              fileType="video"
              duration={videoInfo ? videoInfo.duration : 60}
              onCompress={handleCompress}
              isProcessing={isProcessing}
            />
          )}

        </div>
      )}

    </div>
  );
}
