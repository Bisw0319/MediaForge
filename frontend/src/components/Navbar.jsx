import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Scissors, 
  RefreshCw, 
  Maximize2, 
  UploadCloud, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronDown,
  FileImage,
  Video,
  FileText,
  Music,
  FileArchive,
  Info,
  Shield,
  HelpCircle,
  Search,
  FileUp
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onTriggerUpload, onOpenSearch, onSelectPdfTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compressDropdownOpen, setCompressDropdownOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Default is always bright (light) mode unless user explicitly selected dark previously
    const saved = localStorage.getItem('mediaforge_theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mediaforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mediaforge_theme', 'light');
    }
  };

  const navTo = (page, tab) => {
    setActivePage(page);
    if (tab && onSelectPdfTab) onSelectPdfTab(tab);
    setMobileMenuOpen(false);
    setCompressDropdownOpen(false);
    setConvertDropdownOpen(false);
    setPdfDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => navTo('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Media</span>
                <span className="font-extrabold text-xl tracking-tight text-brand-600 dark:text-brand-400">Forge</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase -mt-1 hidden sm:block">
                Smart Media Optimization
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            
            {/* Compress Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCompressDropdownOpen(!compressDropdownOpen)}
                onBlur={() => setTimeout(() => setCompressDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                  ['image-compressor', 'video-compressor', 'pdf-compressor', 'audio-compressor', 'zip-creator'].includes(activePage)
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Compress</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {compressDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-up">
                  <button
                    onClick={() => navTo('image-compressor')}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Image Compressor</p>
                      <p className="text-xs text-slate-500">JPG, PNG, WEBP, AVIF</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navTo('video-compressor')}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Video Compressor</p>
                      <p className="text-xs text-slate-500">MP4, MOV, WEBM, MKV</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navTo('pdf-compressor')}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">PDF Compressor</p>
                      <p className="text-xs text-slate-500">Documents & Reports</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navTo('audio-compressor')}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Audio Compressor</p>
                      <p className="text-xs text-slate-500">MP3, WAV, AAC, FLAC</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navTo('zip-creator')}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                      <FileArchive className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Make ZIP Archive</p>
                      <p className="text-xs text-slate-500">Bundle Multiple Files</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Remove Background */}
            <button
              onClick={() => navTo('background-remover')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                activePage === 'background-remover'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Remove Background</span>
            </button>

            {/* Convert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setConvertDropdownOpen(!convertDropdownOpen)}
                onBlur={() => setTimeout(() => setConvertDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                  ['image-converter', 'video-converter'].includes(activePage)
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {convertDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-up">
                  <button
                    onClick={() => navTo('image-converter')}
                    className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <FileImage className="w-4 h-4 text-brand-500" />
                    <span>Image Converter</span>
                  </button>
                  <button
                    onClick={() => navTo('video-converter')}
                    className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Video className="w-4 h-4 text-purple-500" />
                    <span>Video Converter</span>
                  </button>
                </div>
              )}
            </div>

            {/* PDF Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPdfDropdownOpen(!pdfDropdownOpen)}
                onBlur={() => setTimeout(() => setPdfDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                  activePage === 'pdf-tools'
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {pdfDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-up">
                  <button
                    onClick={() => navTo('pdf-tools', 'img-to-pdf')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Image to PDF</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'pdf-to-word')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>PDF to Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'word-to-pdf')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>Word to PDF</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'pdf-to-jpg')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>PDF to JPG</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'merge-pdf')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Merge PDF</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'split-pdf')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Split PDF</span>
                  </button>
                  <button
                    onClick={() => navTo('pdf-tools', 'pdf-to-excel')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>PDF to Excel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Resize */}
            <button
              onClick={() => navTo('image-resizer')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                activePage === 'image-resizer'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Resize</span>
            </button>
          </nav>

          {/* Action CTAs: Search Icon, Theme Toggle & Upload File */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              aria-label="Search tools"
              title="Search tools & conversions (Ctrl+K)"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button
              onClick={() => {
                if (onTriggerUpload) onTriggerUpload();
                else navTo('home');
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Mobile menu trigger + mobile search icon */}
          <div className="flex sm:hidden items-center space-x-1">
            <button
              onClick={onOpenSearch}
              aria-label="Search tools"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
            >
              <Search className="w-5 h-5 text-brand-500" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 animate-fadeIn max-h-[85vh] overflow-y-auto">
          {/* Quick Search in Mobile Drawer */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenSearch) onOpenSearch();
            }}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 mb-2 shadow-sm"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-brand-500" />
              <span>Search all tools & features...</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Search</span>
          </button>

          <p className="text-xs uppercase font-bold text-slate-400 px-3 pt-2">Compression Tools</p>
          <button
            onClick={() => navTo('image-compressor')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileImage className="w-4 h-4 text-blue-500" />
            <span>Image Compressor</span>
          </button>
          <button
            onClick={() => navTo('video-compressor')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Video className="w-4 h-4 text-purple-500" />
            <span>Video Compressor</span>
          </button>
          <button
            onClick={() => navTo('pdf-compressor')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>PDF Compressor</span>
          </button>
          <button
            onClick={() => navTo('audio-compressor')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
          >
            <Music className="w-4 h-4 text-amber-500" />
            <span>Audio Compressor</span>
          </button>
          <button
            onClick={() => navTo('zip-creator')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
          >
            <FileArchive className="w-4 h-4 text-emerald-500" />
            <span>Make ZIP Archive</span>
          </button>

          <p className="text-xs uppercase font-bold text-slate-400 px-3 pt-3">Optimization & AI</p>
          <button
            onClick={() => navTo('background-remover')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Scissors className="w-4 h-4 text-emerald-500" />
            <span>Remove Background</span>
          </button>
          <button
            onClick={() => navTo('image-resizer')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Maximize2 className="w-4 h-4 text-sky-500" />
            <span>Image Resizer</span>
          </button>
          <button
            onClick={() => navTo('image-converter')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            <span>Image Converter</span>
          </button>
          <button
            onClick={() => navTo('video-converter')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 text-pink-500" />
            <span>Video Converter</span>
          </button>

          <p className="text-xs uppercase font-bold text-slate-400 px-3 pt-3">PDF & Document Suite</p>
          <button
            onClick={() => navTo('pdf-tools', 'img-to-pdf')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileUp className="w-4 h-4 text-blue-500" />
            <span>Image to PDF</span>
          </button>
          <button
            onClick={() => navTo('pdf-tools', 'pdf-to-word')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>PDF to Word (.docx)</span>
          </button>
          <button
            onClick={() => navTo('pdf-tools', 'word-to-pdf')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-sky-500" />
            <span>Word to PDF</span>
          </button>
          <button
            onClick={() => navTo('pdf-tools', 'pdf-to-jpg')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileImage className="w-4 h-4 text-amber-500" />
            <span>PDF to JPG</span>
          </button>
          <button
            onClick={() => navTo('pdf-tools', 'merge-pdf')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Merge & Split PDF</span>
          </button>
          <button
            onClick={() => navTo('pdf-tools', 'pdf-to-excel')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>PDF to Excel</span>
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
            <button
              onClick={() => {
                if (onTriggerUpload) onTriggerUpload();
                else navTo('home');
              }}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm flex items-center justify-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload File</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
