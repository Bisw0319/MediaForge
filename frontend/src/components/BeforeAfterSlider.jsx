import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original',
  afterLabel = 'Optimized',
  isTransparent = false
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPosition(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        <span>Visual Quality Comparison</span>
        <span>Drag slider to compare</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        className={`relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden cursor-ew-resize select-none touch-none border border-slate-200 dark:border-slate-800 ${
          isTransparent ? 'bg-checkerboard' : 'bg-slate-900'
        }`}
      >
        {/* After (Optimized) Image - Background layer */}
        <img
          src={afterSrc}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Before (Original) Image - Clipped top layer */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeSrc}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          />
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
            {beforeLabel}
          </span>
        </div>

        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-brand-600/80 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
            {afterLabel}
          </span>
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-lg flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
          >
            <ChevronsLeftRight className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
