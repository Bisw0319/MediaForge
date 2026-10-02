import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Music, Sparkles } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function AudioComparisonPlayer({
  originalSrc,
  compressedSrc,
  originalSize,
  compressedSize
}) {
  const [activeTrack, setActiveTrack] = useState('compressed'); // 'original' | 'compressed'
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const switchTrack = (track) => {
    const wasPlaying = isPlaying;
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
    setActiveTrack(track);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTime;
        if (wasPlaying) {
          audioRef.current.play();
        }
      }
    }, 50);
  };

  const currentSrc = activeTrack === 'compressed' ? compressedSrc : originalSrc;

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-brand-500" />
          <span>A/B Audio Quality Comparison</span>
        </h4>
        <span className="text-xs text-slate-500">Switch tracks seamlessly during playback</span>
      </div>

      {/* Track Toggle Buttons */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => switchTrack('original')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTrack === 'original'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-slate-400" />
          <span>Original ({formatBytes(originalSize)})</span>
        </button>

        <button
          type="button"
          onClick={() => switchTrack('compressed')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTrack === 'compressed'
              ? 'bg-brand-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Optimized ({formatBytes(compressedSize)})</span>
        </button>
      </div>

      {/* Audio Element & Controls */}
      <div className="pt-2">
        <audio
          ref={audioRef}
          src={currentSrc}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          controls
          className="w-full h-11 rounded-lg"
        />
      </div>

      <p className="text-[11px] text-center text-slate-400">
        Playing <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">{activeTrack}</span> track.
        Listen for vocal crispness and frequency response.
      </p>
    </div>
  );
}
