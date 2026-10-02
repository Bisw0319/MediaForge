# MediaForge ⚡

> **“Make files smaller. Keep them useful.”**
>
> An all-in-one file compression and media optimization platform featuring custom, user-controlled target-size compression.

---

## 🌟 Key Features

1. **User-Controlled Compression (The Core Principle)**
   - Never forced into arbitrary *Low / Medium / High* presets.
   - **Mode 1 — Target Size**: Enter desired output file size (e.g., 500 MB down to 100 MB, or 25 MB down to 5 MB).
   - **Mode 2 — Percentage Reduction**: Select desired reduction percentage (e.g. reduce by 70%).
   - **Mode 3 — Quality Slider**: Perceptual quality slider (Smaller File $\leftarrow\rightarrow$ Better Quality).
   - **Live Size Estimation**: Instant pre-compression calculations.

2. **Dedicated Media Optimizers**
   - **Image Compressor**: JPG, PNG, WEBP, AVIF with interactive before/after split comparison slider and multi-file batch upload with **Download All as ZIP**.
   - **Video Compressor**: Powered by **FFmpeg** with automatic bitrate calculation, resolution downscaling (to prevent blockiness), and FastStart MP4 web streaming.
   - **PDF Compressor**: PyMuPDF stream deflation, font deduplication, and embedded image downsampling (Recommended, Maximum, and Custom modes).
   - **Audio Compressor**: Intelligent MP3/LAME compression with A/B dual player comparison.
   - **Background Remover**: AI-powered subject segmentation (**U2Net / ONNX Runtime**) with transparent checkerboard preview, solid color swatches, and gradient backgrounds.
   - **Image Resizer**: Exact dimension control with aspect ratio locking and social media presets (Instagram, YouTube, Twitter/X, LinkedIn, Facebook).
   - **Image & Video Converters**: Cross-format conversion (JPG, PNG, WEBP, BMP, MP4, WEBM, GIF).

3. **Privacy & Ephemeral Storage**
   - Background daemon automatically purges temporary uploads and outputs older than 30 minutes.
   - Zero long-term retention.
   - UUID-randomized filenames preventing collision and path traversal.

---

## 🏗️ Architecture

```
MediaForge/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application with CORS & lifespan cleanup daemon
│   │   ├── routes/
│   │   │   ├── compression.py   # Estimation, ZIP archives, downloads, previews, cleanup
│   │   │   ├── image.py         # Single & batch compression, resize, convert, inspect
│   │   │   ├── video.py         # Metadata extraction, bitrate compression, transcode
│   │   │   ├── pdf.py           # Page count, deflation, image downsampling
│   │   │   ├── audio.py         # Duration analysis, target-size bitrate compression
│   │   │   └── background.py    # AI subject segmentation with background replacement
│   │   ├── services/
│   │   │   ├── image_service.py
│   │   │   ├── video_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── audio_service.py
│   │   │   └── background_service.py
│   │   └── utils/
│   │       ├── ffmpeg_utils.py  # PATH & bundled FFmpeg detection and command runner
│   │       ├── file_utils.py    # Safe names, byte formatting, ZIP archives
│   │       └── cleanup_utils.py # Automatic 30-min file purge
│   ├── temp/                    # Ephemeral workspace (uploads, processed, archives)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx               # Sticky navbar with dropdowns & dark mode toggle
    │   │   ├── Footer.jsx               # Navigation, features, and privacy guarantees
    │   │   ├── DropZone.jsx             # Universal animated drag-and-drop zone
    │   │   ├── CompressionControls.jsx  # Target size, percentage, quality, live estimates
    │   │   ├── ProcessingProgress.jsx   # Multi-stage progress indicator
    │   │   ├── ResultCard.jsx           # Metrics, savings breakdown, and downloads
    │   │   ├── BeforeAfterSlider.jsx    # Draggable before/after comparison slider
    │   │   ├── AudioComparisonPlayer.jsx# A/B audio player
    │   │   ├── VideoPreviewPlayer.jsx   # HTML5 video preview player
    │   │   └── BatchList.jsx            # Multi-file batch tracking and ZIP packaging
    │   ├── pages/                       # Home, Compressors, Tools, About, Privacy, Terms
    │   └── services/api.js              # REST API client
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Running the Project Locally

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173/`
