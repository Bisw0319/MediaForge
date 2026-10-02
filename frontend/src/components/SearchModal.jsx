import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  FileImage, 
  Video, 
  FileText, 
  Music, 
  FileArchive, 
  Scissors, 
  Maximize2, 
  RefreshCw, 
  FileSpreadsheet, 
  FileUp, 
  Lock, 
  RotateCw,
  Sparkles,
  Command
} from 'lucide-react';

export const SEARCH_TOOLS = [
  // Compression tools
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Compress JPG, PNG, WEBP with exact target size or quality slider.',
    category: 'Compress',
    icon: FileImage,
    color: 'from-blue-500 to-sky-400',
    keywords: ['image', 'photo', 'picture', 'jpg', 'jpeg', 'png', 'webp', 'avif', 'shrink', 'compress', 'target size']
  },
  {
    id: 'video-compressor',
    title: 'Video Compressor',
    description: 'Reduce video file size (MP4, MOV, WEBM) without blurry pixels.',
    category: 'Compress',
    icon: Video,
    color: 'from-purple-500 to-indigo-500',
    keywords: ['video', 'movie', 'clip', 'mp4', 'mov', 'webm', 'mkv', 'compress', 'reduce size']
  },
  {
    id: 'pdf-compressor',
    title: 'PDF Compressor',
    description: 'Shrink large PDF documents and invoices for email and upload limits.',
    category: 'Compress',
    icon: FileText,
    color: 'from-red-500 to-rose-400',
    keywords: ['pdf', 'document', 'compress pdf', 'shrink pdf', 'mb to kb', 'deflate']
  },
  {
    id: 'audio-compressor',
    title: 'Audio Compressor',
    description: 'Optimize MP3, WAV, AAC, FLAC files while keeping clear sound.',
    category: 'Compress',
    icon: Music,
    color: 'from-amber-500 to-orange-400',
    keywords: ['audio', 'music', 'sound', 'mp3', 'wav', 'aac', 'flac', 'compress audio']
  },
  {
    id: 'zip-creator',
    title: 'Make ZIP Archive',
    description: 'Bundle and compress multiple files into a single lightweight ZIP archive.',
    category: 'Compress',
    icon: FileArchive,
    color: 'from-emerald-600 to-teal-500',
    keywords: ['zip', 'archive', 'bundle', 'pack', 'multiple files', 'compress zip']
  },

  // PDF & Document Suite
  {
    id: 'pdf-tools',
    tab: 'img-to-pdf',
    title: 'Image to PDF',
    description: 'Convert photos, JPG, and PNG images into a clean single PDF file.',
    category: 'PDF Suite',
    icon: FileUp,
    color: 'from-indigo-500 to-blue-500',
    keywords: ['img to pdf', 'image to pdf', 'jpg to pdf', 'png to pdf', 'photo to pdf', 'convert to pdf']
  },
  {
    id: 'pdf-tools',
    tab: 'pdf-to-word',
    title: 'PDF to Word (.docx)',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) files.',
    category: 'PDF Suite',
    icon: FileText,
    color: 'from-blue-600 to-sky-500',
    keywords: ['pdf to word', 'pdf to docx', 'word', 'doc', 'editable', 'convert pdf']
  },
  {
    id: 'pdf-tools',
    tab: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Microsoft Word documents (.docx) to standard PDF documents.',
    category: 'PDF Suite',
    icon: FileText,
    color: 'from-sky-600 to-blue-600',
    keywords: ['word to pdf', 'docx to pdf', 'doc to pdf', 'convert word']
  },
  {
    id: 'pdf-tools',
    tab: 'pdf-to-jpg',
    title: 'PDF to JPG Images',
    description: 'Extract pages from a PDF as high-resolution JPG images or ZIP archive.',
    category: 'PDF Suite',
    icon: FileImage,
    color: 'from-amber-500 to-yellow-500',
    keywords: ['pdf to jpg', 'pdf to image', 'extract pages', 'pdf photos', 'pdf to png']
  },
  {
    id: 'pdf-tools',
    tab: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one organized PDF in chosen order.',
    category: 'PDF Suite',
    icon: FileText,
    color: 'from-violet-500 to-purple-600',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'attach pdf', 'unite pdf']
  },
  {
    id: 'pdf-tools',
    tab: 'split-pdf',
    title: 'Split PDF',
    description: 'Extract specific page ranges or split each page into separate PDFs.',
    category: 'PDF Suite',
    icon: Scissors,
    color: 'from-rose-500 to-pink-500',
    keywords: ['split pdf', 'cut pdf', 'separate pdf', 'extract pages', 'divide pdf']
  },
  {
    id: 'pdf-tools',
    tab: 'pdf-to-excel',
    title: 'PDF to Excel (.xlsx)',
    description: 'Extract tables, rows, and structured data from PDF into Microsoft Excel.',
    category: 'PDF Suite',
    icon: FileSpreadsheet,
    color: 'from-emerald-500 to-green-600',
    keywords: ['pdf to excel', 'pdf to xlsx', 'tables', 'spreadsheet', 'data extraction']
  },
  {
    id: 'pdf-tools',
    tab: 'protect-pdf',
    title: 'Protect PDF (Password Encrypt)',
    description: 'Lock your sensitive PDF with standard AES-256 password encryption.',
    category: 'PDF Suite',
    icon: Lock,
    color: 'from-slate-700 to-slate-900',
    keywords: ['protect pdf', 'password', 'encrypt', 'lock pdf', 'secure pdf']
  },
  {
    id: 'pdf-tools',
    tab: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate upside-down or sideways PDF pages by 90°, 180°, or 270°.',
    category: 'PDF Suite',
    icon: RotateCw,
    color: 'from-teal-500 to-cyan-500',
    keywords: ['rotate pdf', 'turn pdf', 'orientation', 'flip pages']
  },

  // Edit & Convert tools
  {
    id: 'background-remover',
    title: 'Background Remover',
    description: 'Remove background from portraits, products, or photos using AI cutout.',
    category: 'Edit',
    icon: Scissors,
    color: 'from-emerald-500 to-teal-400',
    keywords: ['remove bg', 'background remover', 'transparent', 'png cutout', 'ai background']
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer & Passport Photo',
    description: 'Resize dimensions, create passport size photos, and use social media presets.',
    category: 'Edit',
    icon: Maximize2,
    color: 'from-sky-500 to-cyan-400',
    keywords: ['resize', 'passport', 'dimensions', 'width', 'height', 'crop', 'instagram', 'linkedin']
  },
  {
    id: 'image-converter',
    title: 'Image Converter',
    description: 'Convert between JPG, PNG, WEBP, AVIF, and BMP formats instantly.',
    category: 'Convert',
    icon: RefreshCw,
    color: 'from-indigo-500 to-blue-500',
    keywords: ['convert image', 'png to jpg', 'jpg to webp', 'transcode image']
  },
  {
    id: 'video-converter',
    title: 'Video Converter',
    description: 'Transcode videos between MP4, WEBM, MOV, MKV, AVI, and GIF formats.',
    category: 'Convert',
    icon: RefreshCw,
    color: 'from-pink-500 to-rose-500',
    keywords: ['convert video', 'mp4 to webm', 'video to gif', 'transcode video']
  }
];

export default function SearchModal({ isOpen, onClose, onSelectTool }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const categories = ['All', 'Compress', 'PDF Suite', 'Convert', 'Edit'];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter tools based on query & category
  const filteredTools = SEARCH_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const titleMatch = tool.title.toLowerCase().includes(q);
    const descMatch = tool.description.toLowerCase().includes(q);
    const keywordMatch = tool.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || descMatch || keywordMatch;
  });

  // Keyboard navigation inside search results
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredTools.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredTools.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools.length > 0 && filteredTools[selectedIndex]) {
          handleSelect(filteredTools[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex]);

  const handleSelect = (tool) => {
    onSelectTool(tool.id, tool.tab);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Search Palette Container */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools, conversions, compressions, resize, merge..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${tool.id}-${tool.tab || 'main'}`}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {tool.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider flex-shrink-0">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform ${
                    isSelected ? 'text-brand-600 dark:text-brand-400 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                  }`} />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No tools found for "{query}"
              </p>
              <p className="text-xs text-slate-400">
                Try searching for 'pdf', 'image', 'word', 'compress', or 'resize'.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px]">↵</kbd>
              <span className="ml-1">Open Tool</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-brand-500" />
            <span>{filteredTools.length} tools available</span>
          </span>
        </div>

      </div>

    </div>
  );
}
