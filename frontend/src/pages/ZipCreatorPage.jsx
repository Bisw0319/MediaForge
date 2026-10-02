import React, { useState, useEffect } from 'react';
import { 
  FileArchive, 
  UploadCloud, 
  ArrowLeft, 
  Download, 
  RotateCcw, 
  Check, 
  Trash2, 
  File, 
  FileText, 
  FileImage, 
  Film, 
  Music, 
  Plus, 
  Sparkles,
  Zap
} from 'lucide-react';
import DropZone from '../components/DropZone';
import ProcessingProgress from '../components/ProcessingProgress';
import ResultCard from '../components/ResultCard';
import { api } from '../services/api';
import { formatBytes } from '../utils/formatters';

export default function ZipCreatorPage({ onBack, initialFile }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [archiveName, setArchiveName] = useState('mediaforge_archive.zip');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('uploading');
  const [processingProgress, setProcessingProgress] = useState(0);

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = (filesOrFile) => {
    setError(null);
    setResult(null);
    const newFiles = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  useEffect(() => {
    if (initialFile) {
      handleFilesSelected(initialFile);
    }
  }, [initialFile]);

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateZip = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);

    setProcessingStage('uploading');
    setProcessingProgress(25);

    const t1 = setTimeout(() => {
      setProcessingStage('compressing');
      setProcessingProgress(65);
    }, 400);

    const t2 = setTimeout(() => {
      setProcessingStage('optimizing');
      setProcessingProgress(90);
    }, 900);

    try {
      const res = await api.createZipArchive({
        files: selectedFiles,
        archiveName: archiveName || 'archive.zip'
      });

      setProcessingStage('complete');
      setProcessingProgress(100);
      setIsProcessing(false);
      setResult(res);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Failed to create ZIP archive.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResult(null);
    setError(null);
    setArchiveName('mediaforge_archive.zip');
  };

  const totalUncompressed = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  const getFileIcon = (filename) => {
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      return <FileImage className="w-4 h-4 text-blue-500" />;
    }
    if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) {
      return <Film className="w-4 h-4 text-purple-500" />;
    }
    if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) {
      return <Music className="w-4 h-4 text-amber-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
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
              <FileArchive className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span>Make ZIP Archive</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Bundle and compress multiple files into a single, high-efficiency ZIP file.
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Start Over
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="space-y-4">
        <DropZone
          onFilesSelected={handleFilesSelected}
          accept="*/*"
          multiple={true}
          title="Drop any files here to package into a ZIP"
          subText="or Browse Files"
          formatsText="All file types supported • Documents, Photos, Videos, Code"
          maxSizeText="Maximum DEFLATE compression"
          icon={FileArchive}
        />
      </div>

      {/* File List & Packaging Controls */}
      {selectedFiles.length > 0 && !isProcessing && !result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'} Selected</span>
              </h3>
              <p className="text-xs text-slate-500">
                Total Uncompressed: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(totalUncompressed)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Files List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs"
              >
                <div className="flex items-center space-x-2.5 truncate mr-3">
                  {getFileIcon(file.name)}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                  <span className="text-slate-400 text-[11px] shrink-0 font-mono">({formatBytes(file.size)})</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 shrink-0"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Archive Name Customization */}
          <div className="pt-2 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              ZIP Archive Name
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={archiveName}
                onChange={(e) => setArchiveName(e.target.value)}
                placeholder="my_bundle.zip"
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleCreateZip}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
          >
            <FileArchive className="w-5 h-5" />
            <span>Create ZIP File ({selectedFiles.length} Files)</span>
          </button>

        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <ProcessingProgress
          stage={processingStage}
          progress={processingProgress}
          fileName={archiveName}
          customMessage="Compressing individual data streams and packaging into ZIP archive..."
        />
      )}

      {/* Result State */}
      {result && (
        <ResultCard
          result={result}
          onReset={handleReset}
          title="ZIP Archive Created Successfully"
          previewComponent={
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <FileArchive className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{result.display_name}</p>
                  <p className="text-[11px] text-slate-400">{result.file_count} files bundled into compressed archive</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                ZIP Ready
              </span>
            </div>
          }
        />
      )}

    </div>
  );
}
