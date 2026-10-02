/**
 * Utility functions for byte formatting and file handling
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function detectFileType(file) {
  if (!file) return 'unknown';
  const type = file.type || '';
  const name = (file.name || '').toLowerCase();

  if (type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tiff|avif)$/i.test(name)) {
    return 'image';
  }
  if (type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv|flv|wmv)$/i.test(name)) {
    return 'video';
  }
  if (type === 'application/pdf' || /\.pdf$/i.test(name)) {
    return 'pdf';
  }
  if (type.startsWith('audio/') || /\.(mp3|wav|aac|m4a|flac|ogg)$/i.test(name)) {
    return 'audio';
  }
  return 'unknown';
}

export function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : '';
}
