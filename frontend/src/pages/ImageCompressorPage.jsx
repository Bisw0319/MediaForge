import React, { useState, useEffect } from 'react';
import { FileImage, UploadCloud, Layers, ArrowLeft, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import DropZone from '../components/DropZone';
import CompressionControls from '../components/CompressionControls';
import ProcessingProgress from '../components/ProcessingProgress';
import ResultCard from '../components/ResultCard';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import BatchList from '../components/BatchList';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function ImageCompressorPage({ initialFile, onBack }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isBatch, setIsBatch] = useState(false);
  const [inspectData, setInspectData] = useState(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);

  // Compression & Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('uploading');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Result state
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [batchZipUrl, setBatchZipUrl] = useState(null);
  const [error, setError] = useState(null);

  // Handle initialFile passed from Home universal dropzone
  useEffect(() => {
    if (initialFile) {
      if (Array.isArray(initialFile) && initialFile.length > 1) {
        handleFilesSelected(initialFile);
      } else {
        const file = Array.isArray(initialFile) ? initialFile[0] : initialFile;
        handleFilesSelected(file);
      }
    }
  }, [initialFile]);

  const handleFilesSelected = (filesOrFile) => {
    setError(null);
    setResult(null);
    setBatchResults([]);
    setBatchZipUrl(null);

    if (Array.isArray(filesOrFile) && filesOrFile.length > 1) {
      setIsBatch(true);
      setSelectedFiles(filesOrFile);
      setOriginalPreviewUrl(null);
      setInspectData(null);
    } else {
      const file = Array.isArray(filesOrFile) ? filesOrFile[0] : filesOrFile;
      setIsBatch(false);
      setSelectedFiles([file]);
      setOriginalPreviewUrl(URL.createObjectURL(file));

      // Inspect file dimensions
      api.inspectImage(file)
        .then((data) => setInspectData(data))
        .catch(() => {});
    }
  };

  const handleCompressSingle = async (settings) => {
    if (!selectedFiles[0]) return;
    const file = selectedFiles[0];
    setIsProcessing(true);
    setError(null);

    // Progress animation timeline
    setProcessingStage('uploading');
    setProcessingProgress(20);

    const timer1 = setTimeout(() => {
      setProcessingStage('analyzing');
      setProcessingProgress(45);
    }, 400);

    const timer2 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(75);
    }, 900);

    try {
      const res = await api.compressImage({
        file,
        mode: settings.mode,
        targetSizeMb: settings.targetSizeMb,
        percentage: settings.percentage,
        quality: settings.quality,
        outputFormat: settings.outputFormat
      });

      setProcessingStage('optimizing');
      setProcessingProgress(95);

      setTimeout(() => {
        setProcessingStage('complete');
        setProcessingProgress(100);
        setIsProcessing(false);
        setResult(res);
      }, 300);

    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Compression failed. Please try a different size.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  const handleCompressBatch = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const batchRes = await api.compressImageBatch({
        files: selectedFiles,
        mode: 'percentage',
        percentage: 60
      });

      setBatchResults(batchRes.results || []);

      // If all or some succeeded, generate zip archive
      const successfulFilenames = (batchRes.results || [])
        .filter((r) => r.success && r.filename)
        .map((r) => r.filename);

      if (successfulFilenames.length > 0) {
        const zipRes = await api.createMultiZip(successfulFilenames);
        setBatchZipUrl(zipRes.download_url);
      }
    } catch (err) {
      setError(err.message || 'Batch compression encountered an error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setIsBatch(false);
    setInspectData(null);
    setResult(null);
    setBatchResults([]);
    setBatchZipUrl(null);
    setError(null);
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
      setOriginalPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Title & Nav Back */}
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
              <FileImage className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              <span>Image Compressor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Reduce image size while maintaining crystal-clear visual quality.
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Upload Different Files
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Upload Dropzone if no file selected */}
      {selectedFiles.length === 0 && (
        <div className="space-y-4">
          <DropZone
            onFilesSelected={handleFilesSelected}
            accept="image/*"
            multiple={true}
            title="Drop your images here"
            subText="or Browse Files"
            formatsText="JPG • PNG • WEBP • AVIF"
            maxSizeText="Multiple upload & ZIP supported"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Target Size Control</p>
              <p className="mt-1">Enter exact megabytes or kilobytes desired.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Before / After Slider</p>
              <p className="mt-1">Inspect side-by-side sharpness before downloading.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-slate-200">Batch Processing</p>
              <p className="mt-1">Upload multiple photos and download as one ZIP.</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Upload Mode */}
      {isBatch && selectedFiles.length > 1 && (
        <BatchList
          files={selectedFiles}
          results={batchResults}
          isProcessing={isProcessing}
          onCompressAll={handleCompressBatch}
          onDownloadZip={() => {
            if (batchZipUrl) window.location.href = batchZipUrl;
          }}
          onClear={handleReset}
          downloadZipUrl={batchZipUrl}
        />
      )}

      {/* Single File Mode */}
      {!isBatch && selectedFiles.length === 1 && (
        <div className="space-y-8">
          
          {/* File Card & Thumbnail */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4 truncate">
              {originalPreviewUrl && (
                <img
                  src={originalPreviewUrl}
                  alt="Original preview"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              )}
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {selectedFiles[0].name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Size: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(selectedFiles[0].size)}</span>
                  {inspectData && (
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      ({inspectData.width} × {inspectData.height} px, {inspectData.format})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shrink-0">
              Ready
            </span>
          </div>

          {/* Processing Progress or Result or Controls */}
          {isProcessing ? (
            <ProcessingProgress
              stage={processingStage}
              progress={processingProgress}
              fileName={selectedFiles[0].name}
            />
          ) : result ? (
            <ResultCard
              result={result}
              onReset={handleReset}
              previewComponent={
                <BeforeAfterSlider
                  beforeSrc={originalPreviewUrl}
                  afterSrc={result.preview_url}
                  beforeLabel={`Original (${formatBytes(result.original_size)})`}
                  afterLabel={`Optimized (${formatBytes(result.compressed_size)})`}
                />
              }
            />
          ) : (
            <CompressionControls
              originalSize={selectedFiles[0].size}
              fileType="image"
              onCompress={handleCompressSingle}
              isProcessing={isProcessing}
            />
          )}

        </div>
      )}

    </div>
  );
}
