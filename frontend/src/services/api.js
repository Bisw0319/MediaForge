/**
 * MediaForge API Service Client
 */

const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE = rawApiBase.replace(/\/+$/, '');

export function getApiAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    const origin = API_BASE.replace(/\/api\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

export function deepNormalizeUrls(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(deepNormalizeUrls);
  }
  const result = { ...obj };
  for (const [key, val] of Object.entries(result)) {
    if (typeof val === 'string' && (key.includes('url') || key.includes('download') || key.includes('preview') || key.includes('path'))) {
      result[key] = getApiAssetUrl(val);
    } else if (typeof val === 'object' && val !== null) {
      result[key] = deepNormalizeUrls(val);
    }
  }
  return result;
}

export async function downloadFile(url, filename = 'downloaded_file') {
  const fullUrl = getApiAssetUrl(url);
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) {
      throw new Error(`Server returned error ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to direct navigation:', err);
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred while processing your file.';
    try {
      const data = await response.json();
      errorMsg = data.detail || data.error || errorMsg;
    } catch {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorMsg = 'MediaForge backend server is offline (Status 502). Please ensure the backend is running via run.bat or npm run dev.';
      } else if (response.status === 404) {
        errorMsg = 'API endpoint not found (Status 404). Please verify backend version.';
      } else if (response.status === 413) {
        errorMsg = 'File is too large for the server to process. Please try a smaller file.';
      } else {
        errorMsg = `Server responded with status ${response.status}`;
      }
    }
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return deepNormalizeUrls(data);
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async estimateCompression(params) {
    const res = await fetch(`${API_BASE}/compression/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async createMultiZip(filenames) {
    const res = await fetch(`${API_BASE}/compression/multi-zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames }),
    });
    return handleResponse(res);
  },

  async createZipArchive({ files, archiveName }) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (archiveName) formData.append('archive_name', archiveName);

    const res = await fetch(`${API_BASE}/compression/create-zip`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Image APIs
  async inspectImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/image/inspect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async compressImage({ file, mode, targetSizeMb, percentage, quality, outputFormat }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode || 'target_size');
    if (targetSizeMb !== undefined && targetSizeMb !== null) formData.append('target_size_mb', targetSizeMb);
    if (percentage !== undefined && percentage !== null) formData.append('percentage', percentage);
    if (quality !== undefined && quality !== null) formData.append('quality', quality);
    if (outputFormat) formData.append('output_format', outputFormat);

    const res = await fetch(`${API_BASE}/image/compress`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async compressImageBatch({ files, mode, targetSizeMb, percentage, quality, outputFormat }) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('mode', mode || 'target_size');
    if (targetSizeMb !== undefined && targetSizeMb !== null) formData.append('target_size_mb', targetSizeMb);
    if (percentage !== undefined && percentage !== null) formData.append('percentage', percentage);
    if (quality !== undefined && quality !== null) formData.append('quality', quality);
    if (outputFormat) formData.append('output_format', outputFormat);

    const res = await fetch(`${API_BASE}/image/compress-batch`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async resizeImage({ file, width, height, lockAspectRatio, preset }) {
    const formData = new FormData();
    formData.append('file', file);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);
    formData.append('lock_aspect_ratio', lockAspectRatio !== false);
    if (preset) formData.append('preset', preset);

    const res = await fetch(`${API_BASE}/image/resize`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async convertImage({ file, targetFormat, quality }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat || 'WEBP');
    formData.append('quality', quality || 90);

    const res = await fetch(`${API_BASE}/image/convert`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Video APIs
  async inspectVideo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/video/inspect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async compressVideo({ file, mode, targetSizeMb, percentage, quality, preset }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode || 'target_size');
    if (targetSizeMb !== undefined && targetSizeMb !== null) formData.append('target_size_mb', targetSizeMb);
    if (percentage !== undefined && percentage !== null) formData.append('percentage', percentage);
    if (quality !== undefined && quality !== null) formData.append('quality', quality);
    if (preset) formData.append('preset', preset);

    const res = await fetch(`${API_BASE}/video/compress`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async convertVideo({ file, targetFormat }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat || 'MP4');

    const res = await fetch(`${API_BASE}/video/convert`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // PDF APIs
  async inspectPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/pdf/inspect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async compressPdf({ file, mode, targetSizeMb }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode || 'recommended');
    if (targetSizeMb !== undefined && targetSizeMb !== null) formData.append('target_size_mb', targetSizeMb);

    const res = await fetch(`${API_BASE}/pdf/compress`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Audio APIs
  async inspectAudio(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/audio/inspect`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async compressAudio({ file, mode, targetSizeMb, percentage, quality }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode || 'target_size');
    if (targetSizeMb !== undefined && targetSizeMb !== null) formData.append('target_size_mb', targetSizeMb);
    if (percentage !== undefined && percentage !== null) formData.append('percentage', percentage);
    if (quality !== undefined && quality !== null) formData.append('quality', quality);

    const res = await fetch(`${API_BASE}/audio/compress`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Background Removal API
  async removeBackground({ file, bgType, customColor, gradientTheme, modelType }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bg_type', bgType || 'transparent');
    if (customColor) formData.append('custom_color', customColor);
    if (gradientTheme) formData.append('gradient_theme', gradientTheme);
    if (modelType) formData.append('model_type', modelType);

    const res = await fetch(`${API_BASE}/background/remove`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Bug Report API
  async submitBugReport({ category, description, userAgent }) {
    const res = await fetch(`${API_BASE}/bug-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        description,
        user_agent: userAgent || navigator.userAgent
      }),
    });
    return handleResponse(res);
  },
};
