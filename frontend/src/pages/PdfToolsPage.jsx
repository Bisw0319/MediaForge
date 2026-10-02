import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileUp, 
  Scissors, 
  Lock, 
  RotateCw, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  Eye,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import DropZone from '../components/DropZone';
import ProcessingProgress from '../components/ProcessingProgress';
import { formatBytes } from '../utils/formatters';
import { API_BASE } from '../services/api';

const PDF_TABS = [
  { id: 'img-to-pdf', label: 'Image to PDF', icon: FileUp, accept: 'image/*', multiple: true, desc: 'Convert JPG, PNG, WEBP images into a clean single PDF.' },
  { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText, accept: '.pdf,application/pdf', multiple: false, desc: 'Convert PDF documents into editable Word (.docx) files.' },
  { id: 'word-to-pdf', label: 'Word to PDF', icon: FileText, accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', multiple: false, desc: 'Convert Word (.docx) documents into high-quality PDFs.' },
  { id: 'pdf-to-jpg', label: 'PDF to JPG', icon: FileImage, accept: '.pdf,application/pdf', multiple: false, desc: 'Extract pages as crisp JPG images or ZIP package.' },
  { id: 'merge-pdf', label: 'Merge PDF', icon: Layers, accept: '.pdf,application/pdf', multiple: true, desc: 'Combine multiple PDF documents into one single file.' },
  { id: 'split-pdf', label: 'Split PDF', icon: Scissors, accept: '.pdf,application/pdf', multiple: false, desc: 'Extract custom page ranges or separate all pages.' },
  { id: 'pdf-to-excel', label: 'PDF to Excel', icon: FileSpreadsheet, accept: '.pdf,application/pdf', multiple: false, desc: 'Extract tables and structured data to Excel (.xlsx).' },
  { id: 'protect-pdf', label: 'Protect PDF', icon: Lock, accept: '.pdf,application/pdf', multiple: false, desc: 'Encrypt PDF with AES-256 password protection.' },
  { id: 'rotate-pdf', label: 'Rotate PDF', icon: RotateCw, accept: '.pdf,application/pdf', multiple: false, desc: 'Rotate pages 90°, 180°, or 270° clockwise.' }
];

export default function PdfToolsPage({ initialTab = 'img-to-pdf', initialFile = null, onBack, onNavigateToCompressor }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Tab specific options
  const [dpi, setDpi] = useState(150);
  const [splitMode, setSplitMode] = useState('range'); // 'range' or 'all_pages'
  const [pageRange, setPageRange] = useState('1');
  const [password, setPassword] = useState('');
  const [rotationAngle, setRotationAngle] = useState(90);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialFile) {
      setFiles(Array.isArray(initialFile) ? initialFile : [initialFile]);
      setResult(null);
      setError(null);
    }
  }, [initialFile]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const handleFilesSelected = (newFiles) => {
    const fileList = Array.isArray(newFiles) ? newFiles : [newFiles];
    const currentTabObj = PDF_TABS.find((t) => t.id === activeTab);
    if (!currentTabObj?.multiple && fileList.length > 1) {
      setFiles([fileList[0]]);
    } else {
      setFiles(fileList);
    }
    setResult(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!files || files.length === 0) {
      setError('Please select at least one file first.');
      return;
    }

    if (activeTab === 'protect-pdf' && !password.trim()) {
      setError('Please enter a password to protect the PDF document.');
      return;
    }

    setProcessing(true);
    setProgress(15);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 88 ? prev + 12 : prev));
    }, 250);

    try {
      const formData = new FormData();
      let endpoint = '';

      if (activeTab === 'img-to-pdf') {
        endpoint = `${API_BASE}/pdf-tools/img-to-pdf`;
        files.forEach((f) => formData.append('files', f));
      } else if (activeTab === 'pdf-to-word') {
        endpoint = `${API_BASE}/pdf-tools/pdf-to-word`;
        formData.append('file', files[0]);
      } else if (activeTab === 'word-to-pdf') {
        endpoint = `${API_BASE}/pdf-tools/word-to-pdf`;
        formData.append('file', files[0]);
      } else if (activeTab === 'pdf-to-jpg') {
        endpoint = `${API_BASE}/pdf-tools/pdf-to-jpg`;
        formData.append('file', files[0]);
        formData.append('dpi', dpi);
      } else if (activeTab === 'merge-pdf') {
        endpoint = `${API_BASE}/pdf-tools/merge`;
        files.forEach((f) => formData.append('files', f));
      } else if (activeTab === 'split-pdf') {
        endpoint = `${API_BASE}/pdf-tools/split`;
        formData.append('file', files[0]);
        formData.append('split_mode', splitMode);
        if (splitMode === 'range') {
          formData.append('page_range', pageRange || '1');
        }
      } else if (activeTab === 'pdf-to-excel') {
        endpoint = `${API_BASE}/pdf-tools/pdf-to-excel`;
        formData.append('file', files[0]);
      } else if (activeTab === 'protect-pdf') {
        endpoint = `${API_BASE}/pdf-tools/protect`;
        formData.append('file', files[0]);
        formData.append('password', password);
      } else if (activeTab === 'rotate-pdf') {
        endpoint = `${API_BASE}/pdf-tools/rotate`;
        formData.append('file', files[0]);
        formData.append('angle', rotationAngle);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        let errorMsg = 'Failed to process document. Please verify your file.';
        try {
          const errorData = await res.json();
          errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch {
          if (res.status === 502 || res.status === 503 || res.status === 504) {
            errorMsg = 'MediaForge backend server is offline (Status 502). Please ensure the backend is running via run.bat or npm run dev.';
          } else {
            errorMsg = `Server responded with status ${res.status}`;
          }
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const currentTab = PDF_TABS.find((t) => t.id === activeTab) || PDF_TABS[0];
  const Icon = currentTab.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Navigation Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
            PDF & Document Suite
          </span>
          {onNavigateToCompressor && (
            <button
              onClick={onNavigateToCompressor}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              Need Compression? Click here →
            </button>
          )}
        </div>
      </div>

      {/* Hero Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          All-in-One <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">PDF & Document</span> Tools
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fast, private, server-powered conversions with zero quality loss or watermarks.
        </p>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 min-w-max">
          {PDF_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Tool Banner */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentTab.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentTab.desc}
            </p>
          </div>
        </div>

        {/* File Upload DropZone */}
        {files.length === 0 && (
          <DropZone
            onFilesSelected={handleFilesSelected}
            title={`Drop your ${currentTab.multiple ? 'files' : 'file'} here`}
            subText="or click to browse"
            formatsText={currentTab.accept}
            multiple={currentTab.multiple}
          />
        )}

        {/* Selected Files Display & Tool Specific Settings */}
        {files.length > 0 && !result && (
          <div className="space-y-6">
            
            {/* File List */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {files.length === 1 ? 'Selected File' : `${files.length} Files Selected`}
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500"
                >
                  Change Files
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-200/60 dark:divide-slate-700/60">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                    </div>
                    <span className="text-slate-400 ml-3 flex-shrink-0">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tool-specific customization settings */}
            {activeTab === 'pdf-to-jpg' && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Image Resolution (DPI):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDpi(150)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      dpi === 150
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">150 DPI (Standard)</p>
                    <p className="text-[10px] text-slate-500">Fast rendering, small file size</p>
                  </button>
                  <button
                    onClick={() => setDpi(300)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      dpi === 300
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">300 DPI (High Res)</p>
                    <p className="text-[10px] text-slate-500">Crisp print quality</p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'split-pdf' && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Split Mode:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSplitMode('range')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      splitMode === 'range'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Extract Range</p>
                    <p className="text-[10px] text-slate-500">Select specific pages</p>
                  </button>
                  <button
                    onClick={() => setSplitMode('all_pages')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      splitMode === 'all_pages'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">Split Every Page</p>
                    <p className="text-[10px] text-slate-500">Download all pages in ZIP</p>
                  </button>
                </div>

                {splitMode === 'range' && (
                  <div className="pt-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Enter page numbers or ranges (e.g. 1-3, 5, 8-10):
                    </label>
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="1-3, 5"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'protect-pdf' && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-500" />
                  <span>Enter Password to Lock PDF:</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set strong document password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400">
                  Documents are encrypted using industrial AES-256 standard encryption.
                </p>
              </div>
            )}

            {activeTab === 'rotate-pdf' && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rotation Angle:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { angle: 90, label: '90° Clockwise' },
                    { angle: 180, label: '180° Upside Down' },
                    { angle: 270, label: '270° (90° Counter)' }
                  ].map((r) => (
                    <button
                      key={r.angle}
                      onClick={() => setRotationAngle(r.angle)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        rotationAngle === r.angle
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <RotateCw className="w-4 h-4 mx-auto mb-1" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress Bar */}
            {processing && (
              <ProcessingProgress
                progress={progress}
                stage="Processing document securely on server..."
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleProcess}
                disabled={processing}
                className="flex-1 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{processing ? 'Processing...' : `Convert with ${currentTab.label}`}</span>
              </button>

              <button
                onClick={handleReset}
                disabled={processing}
                className="py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        )}

        {/* Conversion Result Card */}
        {result && (
          <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-5 animate-slide-up">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                  Document Converted Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {result.filename}
                </p>
              </div>
            </div>

            {/* Metadata Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400">Original Size</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{result.original_size_formatted}</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-400">Output Size</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{result.processed_size_formatted}</p>
              </div>
              {result.pages_count && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <p className="text-slate-400">Pages Processed</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{result.pages_count} pages</p>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={result.download_url}
                download
                className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Converted File</span>
              </a>

              <button
                onClick={handleReset}
                className="py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
