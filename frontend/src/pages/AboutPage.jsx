import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Server, 
  Scissors, 
  Maximize2, 
  RefreshCw, 
  FileText, 
  FileArchive, 
  ArrowRight 
} from 'lucide-react';

export default function AboutPage({ setActivePage }) {
  const navTo = (page) => {
    if (setActivePage) {
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const featurePrompts = [
    {
      title: 'Smart Compression',
      prompt: 'Hit exact MB targets (e.g. 25 MB Discord, 10 MB Email) or percentage cuts for Video, Image, PDF & Audio without pixel blur.',
      icon: Zap,
      page: 'image-compressor',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      title: 'AI Background Removal',
      prompt: '1-click deep learning subject cutout for transparent PNGs, solid studio colors, or high-definition gradient backdrops.',
      icon: Scissors,
      page: 'background-remover',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Precision Resizer',
      prompt: 'Exact pixel dimensions, certified passport photo standards, and social media aspect ratios with zero stretching.',
      icon: Maximize2,
      page: 'image-resizer',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Universal Converter',
      prompt: 'Lossless transcoding between MP4, MKV, MOV, WEBM, GIF, PNG, JPG, WEBP, and AVIF.',
      icon: RefreshCw,
      page: 'image-converter',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'PDF & Document Suite',
      prompt: 'Merge, split, compress, protect, rotate, and convert PDF ⇄ Word, Excel, and high-res images in seconds.',
      icon: FileText,
      page: 'pdf-tools',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
    },
    {
      title: 'Multi-File ZIP Archiver',
      prompt: 'Bundle and compress multiple processed outputs into clean, high-speed ZIP archives in one tap.',
      icon: FileArchive,
      page: 'zip-creator',
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-bold uppercase tracking-wider">
          About MediaForge
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Make files smaller. <br />
          <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
            Keep them useful.
          </span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          MediaForge was built on a simple premise: traditional compression software forces users into arbitrary “Low / Medium / High” boxes that rarely match the actual target requirement.
        </p>
      </div>

      {/* The MediaForge Principle */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-[11px] font-bold uppercase tracking-wider">
            The MediaForge Principle
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            “You set the requirement. MediaForge handles the complexity.”
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Never get locked into confusing menus or arbitrary quality presets. Specify what you need, and our server calculates the exact bitrates, quantization matrices, and resolution scales to hit your target while maximizing clarity.
          </p>
        </div>

        {/* Feature Prompts In Short */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Feature Capabilities In Short
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {featurePrompts.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  onClick={() => navTo(feat.page)}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl border ${feat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {feat.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                      {feat.prompt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Zero Pixel Blurring</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-sky-500" />
            <span>FFmpeg, Pillow & PyMuPDF Engine</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Zero Permanent Data Retention</span>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Powered by Industry-Grade Open Source Engines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">FFmpeg Transcoding Pipeline</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Handles H.264, VP9, and LAME MP3 encoding with dynamic CRF and two-pass rate control.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pillow & OpenCV Graphics</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                High-quality Lanczos resampling, color matrix conversion, and perceptual JPEG/WEBP compression.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">U2Net AI Background Segmentation</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ONNX Runtime-powered deep learning model that detects foreground subjects and delivers clean alpha cutouts.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">PyMuPDF Stream Deflation</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Performs deep document sanitation, object deduplication, font deflation, and embedded image downsampling.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
