import subprocess
import shutil
import json
import re
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("mediaforge.ffmpeg")

_FFMPEG_PATH: Optional[str] = None

def get_ffmpeg_path() -> str:
    global _FFMPEG_PATH
    if _FFMPEG_PATH and os.path.exists(_FFMPEG_PATH):
        return _FFMPEG_PATH

    # Check system PATH first
    which_ffmpeg = shutil.which("ffmpeg")
    if which_ffmpeg:
        _FFMPEG_PATH = which_ffmpeg
        return _FFMPEG_PATH

    # Fall back to imageio_ffmpeg bundled binary
    try:
        import imageio_ffmpeg
        bundled = imageio_ffmpeg.get_ffmpeg_exe()
        if bundled and os.path.exists(bundled):
            _FFMPEG_PATH = bundled
            return _FFMPEG_PATH
    except Exception as e:
        logger.warning(f"Could not load imageio_ffmpeg: {e}")

    raise RuntimeError("FFmpeg executable not found on system or via imageio_ffmpeg.")


def run_ffmpeg_command(args: list[str], timeout: int = 300) -> tuple[int, str, str]:
    """Runs FFmpeg with given args and returns (returncode, stdout, stderr)"""
    ffmpeg_exe = get_ffmpeg_path()
    cmd = [ffmpeg_exe] + args
    logger.info(f"Running command: {' '.join(cmd)}")
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    
    try:
        stdout, stderr = process.communicate(timeout=timeout)
        return process.returncode, stdout, stderr
    except subprocess.TimeoutExpired:
        process.kill()
        raise TimeoutError(f"FFmpeg command timed out after {timeout} seconds")


def get_media_info(file_path: str) -> Dict[str, Any]:
    """
    Extracts duration, resolution, audio/video streams, bitrate using ffmpeg -i.
    Works reliably without needing a separate ffprobe binary.
    """
    ffmpeg_exe = get_ffmpeg_path()
    cmd = [ffmpeg_exe, "-hide_banner", "-i", file_path]
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace"
    )
    _, stderr = process.communicate(timeout=30)
    
    info: Dict[str, Any] = {
        "duration": 0.0,
        "duration_formatted": "00:00",
        "bitrate_kbps": 0,
        "width": 0,
        "height": 0,
        "has_video": False,
        "has_audio": False,
        "video_codec": None,
        "audio_codec": None,
        "fps": 0.0,
        "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
    }

    # Extract Duration: 00:01:23.45, start: 0.000000, bitrate: 1234 kb/s
    dur_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", stderr)
    if dur_match:
        hours = int(dur_match.group(1))
        mins = int(dur_match.group(2))
        secs = float(dur_match.group(3))
        total_seconds = hours * 3600 + mins * 60 + secs
        info["duration"] = round(total_seconds, 2)
        info["duration_formatted"] = f"{int(total_seconds // 60):02d}:{int(total_seconds % 60):02d}"

    bitrate_match = re.search(r"bitrate:\s*(\d+)\s*kb/s", stderr)
    if bitrate_match:
        info["bitrate_kbps"] = int(bitrate_match.group(1))

    # Video stream line: Stream #0:0: Video: h264 (...), yuv420p, 1920x1080 [SAR 1:1 DAR 16:9], 29.97 fps
    video_match = re.search(r"Stream #\d+:\d+.*?: Video: ([^,\s]+).*?,.*?(\d{2,5})x(\d{2,5})", stderr)
    if video_match:
        info["has_video"] = True
        info["video_codec"] = video_match.group(1)
        info["width"] = int(video_match.group(2))
        info["height"] = int(video_match.group(3))

    fps_match = re.search(r"(\d+(?:\.\d+)?)\s*fps", stderr)
    if fps_match:
        info["fps"] = float(fps_match.group(1))

    # Audio stream line: Stream #0:1: Audio: aac (...), 48000 Hz, stereo, fltp, 128 kb/s
    audio_match = re.search(r"Stream #\d+:\d+.*?: Audio: ([^,\s]+)", stderr)
    if audio_match:
        info["has_audio"] = True
        info["audio_codec"] = audio_match.group(1)

    return info
