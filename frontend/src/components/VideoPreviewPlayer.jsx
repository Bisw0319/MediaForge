import React from 'react';
import { Video, Film, Sparkles } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function VideoPreviewPlayer({
  videoSrc,
  originalSize,
  compressedSize,
  resolution,
  durationFormatted
}) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Film className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Optimized Video Preview
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          {resolution && <span className="px-2 py-0.5 rounded bg-slate-800">{resolution}</span>}
          {durationFormatted && <span className="px-2 py-0.5 rounded bg-slate-800">{durationFormatted}</span>}
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
        <video
          src={videoSrc}
          controls
          playsInline
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>Web-optimized MP4 with faststart flags for instant streaming</span>
        <span className="text-emerald-400 font-semibold">Ready for distribution</span>
      </div>
    </div>
  );
}
