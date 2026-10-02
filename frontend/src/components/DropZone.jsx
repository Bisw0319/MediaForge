import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, Sparkles } from 'lucide-react';

export default function DropZone({
  onFilesSelected,
  accept = '*/*',
  multiple = false,
  title = 'Drop your file here',
  subText = 'or Browse Files',
  formatsText = 'Images • Videos • PDFs • Audio',
  maxSizeText = 'Up to 200 MB per file',
  icon: CustomIcon
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragOver(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the dropzone boundary itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let droppedFiles = [];
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      droppedFiles = Array.from(e.dataTransfer.files);
    } else if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) droppedFiles.push(f);
        }
      }
    }

    if (droppedFiles.length > 0) {
      if (multiple) {
        onFilesSelected(droppedFiles);
      } else {
        onFilesSelected(droppedFiles[0]);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        onFilesSelected(Array.from(e.target.files));
      } else {
        onFilesSelected(e.target.files[0]);
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const IconComponent = CustomIcon || UploadCloud;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 scale-[1.01] shadow-glow ring-2 ring-brand-400/50'
          : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-850/80'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none select-none">
        {/* Animated Icon Container */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-sm ${
            isDragOver
              ? 'bg-brand-600 text-white scale-110 shadow-glow'
              : 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 group-hover:scale-105 group-hover:bg-brand-100 dark:group-hover:bg-slate-750'
          }`}
        >
          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:rotate-3" />
        </div>

        {/* Text Area */}
        <div className="space-y-1">
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">or </span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2">
              Browse Files
            </span>
          </p>
        </div>

        {/* Format & Size Badge */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
            {formatsText}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
            {maxSizeText}
          </span>
        </div>
      </div>
    </div>
  );
}
