import React, { useRef } from 'react';
import { 
  Sparkles, 
  Scissors, 
  FileImage, 
  Video, 
  FileText, 
  Music, 
  Maximize2, 
  RefreshCw, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Upload, 
  Sliders, 
  Download, 
  Cpu,
  FileArchive,
  FileSpreadsheet,
  FileUp,
  Layers,
  Lock
} from 'lucide-react';
import DropZone from '../components/DropZone';
import { detectFileType } from '../utils/formatters';

export default function HomePage({ setActivePage, onFileSelectedForPage, onSelectPdfTab }) {
  const dropzoneRef = useRef(null);

  const handleHeroStartCompressing = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUniversalFileDrop = (fileOrFiles) => {
    const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
    if (!file) return;

    const fileType = detectFileType(file);
    if (fileType === 'video') {
      onFileSelectedForPage('video-compressor', file);
    } else if (fileType === 'pdf') {
      onFileSelectedForPage('pdf-compressor', file);
    } else if (fileType === 'audio') {
      onFileSelectedForPage('audio-compressor', file);
    } else {
      // Default to image compressor (handles images and batches)
      onFileSelectedForPage('image-compressor', fileOrFiles);
    }
  };

  const tools = [
    {
      id: 'image-compressor',
      title: 'Image Compressor',
      description: 'Reduce image size while maintaining crystal clear quality.',
      formats: 'JPG, PNG, WEBP, AVIF',
      icon: FileImage,
      color: 'from-blue-500 to-sky-400',
      tag: 'Target Size & Quality'
    },
    {
      id: 'video-compressor',
      title: 'Video Compressor',
      description: 'Make large videos smaller with customizable target size.',
      formats: 'MP4, MOV, WEBM, MKV',
      icon: Video,
      color: 'from-purple-500 to-indigo-500',
      tag: 'Smart Bitrate Calc'
    },
    {
      id: 'pdf-compressor',
      title: 'PDF Compressor',
      description: 'Reduce PDF file size for easier sharing and uploads.',
      formats: 'PDF Documents',
      icon: FileText,
      color: 'from-red-500 to-rose-400',
      tag: 'Stream Deflation'
    },
    {
      id: 'audio-compressor',
      title: 'Audio Compressor',
      description: 'Reduce audio size while maintaining good sound quality.',
      formats: 'MP3, WAV, AAC, FLAC',
      icon: Music,
      color: 'from-amber-500 to-orange-400',
      tag: 'A/B Sound Check'
    },
    {
      id: 'zip-creator',
      title: 'Make ZIP Archive',
      description: 'Bundle and compress multiple files into a single ZIP file.',
      formats: 'Any Files • Max DEFLATE',
      icon: FileArchive,
      color: 'from-emerald-600 to-teal-500',
      tag: 'Multi-File Bundle'
    },
    {
      id: 'pdf-tools',
      tab: 'img-to-pdf',
      title: 'Image to PDF',
      description: 'Convert JPG, PNG, and photos into a clean single PDF.',
      formats: 'JPG, PNG, WEBP → PDF',
      icon: FileUp,
      color: 'from-blue-600 to-indigo-500',
      tag: 'Document Creator',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'pdf-to-word',
      title: 'PDF to Word (.docx)',
      description: 'Extract formatted text and tables to an editable Word document.',
      formats: 'PDF → DOCX',
      icon: FileText,
      color: 'from-indigo-600 to-blue-500',
      tag: 'Editable Output',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'word-to-pdf',
      title: 'Word to PDF',
      description: 'Convert Word documents (.docx) to standard PDF documents.',
      formats: 'DOCX → PDF',
      icon: FileText,
      color: 'from-sky-600 to-cyan-500',
      tag: 'Format Shift',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'pdf-to-jpg',
      title: 'PDF to JPG',
      description: 'Render PDF pages into high-resolution JPG images or ZIP.',
      formats: 'PDF → JPG Images',
      icon: FileImage,
      color: 'from-amber-500 to-yellow-500',
      tag: 'High DPI Pixels',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'merge-pdf',
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into one clean document.',
      formats: 'Multiple PDFs → Single PDF',
      icon: Layers,
      color: 'from-purple-600 to-pink-500',
      tag: 'Fast Combine',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'split-pdf',
      title: 'Split PDF',
      description: 'Extract specific page ranges or split each page into ZIP.',
      formats: 'PDF Pages Extractor',
      icon: Scissors,
      color: 'from-rose-500 to-red-500',
      tag: 'Page Selector',
      badge: 'New'
    },
    {
      id: 'pdf-tools',
      tab: 'pdf-to-excel',
      title: 'PDF to Excel (.xlsx)',
      description: 'Extract tabular records and tables into structured spreadsheets.',
      formats: 'PDF → Excel XLSX',
      icon: FileSpreadsheet,
      color: 'from-emerald-500 to-green-600',
      tag: 'Table Extraction',
      badge: 'New'
    },
    {
      id: 'background-remover',
      title: 'Background Remover',
      description: 'Automatically remove the background from an image with AI.',
      formats: 'AI Cutout PNG',
      icon: Scissors,
      color: 'from-teal-500 to-emerald-400',
      tag: 'ONNX Neural Model'
    },
    {
      id: 'image-resizer',
      title: 'Image Resizer & Passport',
      description: 'Resize to exact dimensions or generate passport size photos.',
      formats: 'Social & Passport Presets',
      icon: Maximize2,
      color: 'from-sky-500 to-cyan-400',
      tag: 'Pixel Precision'
    },
    {
      id: 'image-converter',
      title: 'Image Converter',
      description: 'Convert JPG, PNG, WEBP and other supported formats.',
      formats: 'Instant Format Shift',
      icon: RefreshCw,
      color: 'from-indigo-500 to-blue-500',
      tag: 'Fast Transcode'
    },
    {
      id: 'video-converter',
      title: 'Video Converter',
      description: 'Convert videos between supported formats.',
      formats: 'MP4, WEBM, MOV, GIF',
      icon: RefreshCw,
      color: 'from-pink-500 to-rose-500',
      tag: 'FFmpeg Core'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 text-center space-y-8 max-w-4xl mx-auto px-4">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Next-Gen Target-Size Media Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Compress. Convert. <br />
          <span className="bg-gradient-to-r from-brand-600 via-sky-500 to-blue-600 bg-clip-text text-transparent">
            Optimize.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Target-size compression, AI background removal, and multi-format conversion — engineered for ultra-fast, lossless media optimization.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleHeroStartCompressing}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
          >
            <span>Start Compressing</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActivePage('background-remover')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <Scissors className="w-4 h-4 text-emerald-500" />
            <span>Remove Background</span>
          </button>
        </div>

      </section>

      {/* Unified Drag & Drop Upload Area */}
      <section ref={dropzoneRef} className="max-w-4xl mx-auto px-4 scroll-mt-24">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-sky-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 sm:p-4">
            <DropZone
              onFilesSelected={handleUniversalFileDrop}
              title="Drop your file here"
              subText="or Browse Files"
              formatsText="Images • Videos • PDFs • Audio"
              maxSizeText="Auto-detection enabled"
              multiple={true}
            />
          </div>
        </div>
      </section>

      {/* 4-Step Visual Journey */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center space-y-2 mb-12">
          <p className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
            Intuitive Workflow
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How MediaForge Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Four simple steps from original media to lightweight perfection.
          </p>
        </div>

        <div className="flex flex-col space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:space-y-0 sm:gap-6 relative">
          
          {/* Step 1 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand-400 transition-colors flex flex-row items-center sm:flex-col sm:items-start space-x-4 sm:space-x-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-extrabold text-sm flex items-center justify-center sm:mb-4 flex-shrink-0">
              1
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-0.5 sm:mb-1">Upload</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose or drag any image, video, audio file, or PDF document.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand-400 transition-colors flex flex-row items-center sm:flex-col sm:items-start space-x-4 sm:space-x-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 font-extrabold text-sm flex items-center justify-center sm:mb-4 flex-shrink-0">
              2
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-0.5 sm:mb-1">Customize</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tell us how small you want it: exact target size, percentage, or quality.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand-400 transition-colors flex flex-row items-center sm:flex-col sm:items-start space-x-4 sm:space-x-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-extrabold text-sm flex items-center justify-center sm:mb-4 flex-shrink-0">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-0.5 sm:mb-1">Process</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                MediaForge's server calculates optimal bitrates and quantizes without pixelation.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-brand-400 transition-colors flex flex-row items-center sm:flex-col sm:items-start space-x-4 sm:space-x-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-extrabold text-sm flex items-center justify-center sm:mb-4 flex-shrink-0">
              4
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-0.5 sm:mb-1">Download</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare with interactive before/after player and save your optimized file.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Tools Cards Grid - Row-wise 1-by-1 on mobile, grid on desktop */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400">
              Toolbox
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Optimization Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500">Pick a dedicated tool or drag files into the universal box</p>
        </div>

        <div className="flex flex-col space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:space-y-0 sm:gap-5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={`${t.id}-${t.tab || 'main'}`}
                onClick={() => {
                  if (t.tab && onSelectPdfTab) onSelectPdfTab(t.tab);
                  setActivePage(t.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer rounded-2xl p-3.5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 flex flex-row items-center sm:flex-col sm:items-start sm:justify-between justify-between gap-3.5 sm:gap-0"
              >
                {/* Mobile & Desktop Icon */}
                <div className="flex items-center sm:block flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${t.color} text-white flex items-center justify-center sm:mb-4 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0 pr-1 sm:pr-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {t.tag}
                    </span>
                    {t.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate sm:whitespace-normal">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-2 leading-relaxed line-clamp-1 sm:line-clamp-2">
                    {t.description}
                  </p>
                  <p className="sm:hidden text-[10px] text-slate-400 font-medium mt-1 truncate">
                    {t.formats}
                  </p>
                </div>

                {/* Desktop Bottom Bar */}
                <div className="hidden sm:flex pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 w-full">
                  <span>{t.formats}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Mobile Right Arrow Button */}
                <div className="sm:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 flex items-center justify-center flex-shrink-0 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The MediaForge Principle Callout Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 relative overflow-hidden shadow-2xl space-y-8">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading & Principle Statement */}
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              The MediaForge Principle
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              “You set the requirement. MediaForge handles the complexity.”
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Traditional tools force you through confusing menus and arbitrary presets. The MediaForge Principle is simple: specify your destination, and our high-performance engines execute with mathematical precision.
            </p>
          </div>

          {/* Prompts of all features in short */}
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>All Feature Capabilities In Short</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                {
                  title: 'Smart Compression',
                  prompt: 'Hit exact MB targets (Discord 25MB, Email 10MB) or % cuts for Video, Image, PDF & Audio without pixel blur.',
                  icon: Zap,
                  page: 'image-compressor',
                  color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                },
                {
                  title: 'AI Background Removal',
                  prompt: '1-click deep learning subject cutout for transparent PNGs, solid studio colors, or HD gradients.',
                  icon: Scissors,
                  page: 'background-remover',
                  color: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                },
                {
                  title: 'Precision Resizer',
                  prompt: 'Exact pixel dimensions, certified passport standards, and social media aspect ratios with zero stretching.',
                  icon: Maximize2,
                  page: 'image-resizer',
                  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                },
                {
                  title: 'Format Converter',
                  prompt: 'Lossless transcoding between MP4, MKV, MOV, WEBM, GIF, PNG, JPG, WEBP, and AVIF.',
                  icon: RefreshCw,
                  page: 'image-converter',
                  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                },
                {
                  title: 'PDF & Document Suite',
                  prompt: 'Merge, split, compress, protect, rotate, and convert PDF ⇄ Word, Excel, and high-res images in seconds.',
                  icon: FileText,
                  page: 'pdf-tools',
                  color: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                },
                {
                  title: 'Instant ZIP Archiver',
                  prompt: 'Bundle and compress multiple processed assets into clean, high-speed ZIP archives in one tap.',
                  icon: FileArchive,
                  page: 'zip-creator',
                  color: 'text-sky-400 bg-sky-400/10 border-sky-400/20'
                }
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    onClick={() => {
                      if (setActivePage) {
                        setActivePage(feat.page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-400/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-xl border ${feat.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                            {feat.title}
                          </h4>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-0.5">
                        {feat.prompt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Zero Pixel Blurring</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>FFmpeg, Pillow & PyMuPDF Engine</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Client Privacy & Zero Retention</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
