import os
from pathlib import Path
from typing import Optional, Dict, Any

from ..utils.file_utils import (
    PROCESSED_DIR,
    generate_unique_filename,
    format_bytes
)
from ..utils.ffmpeg_utils import (
    run_ffmpeg_command,
    get_media_info
)


class AudioService:

    @staticmethod
    def inspect_audio(file_path: str) -> Dict[str, Any]:
        """Inspects audio file metadata"""
        info = get_media_info(file_path)
        info["original_size"] = os.path.getsize(file_path)
        info["original_size_formatted"] = format_bytes(info["original_size"])
        return info

    @staticmethod
    def compress_audio(
        input_path: str,
        original_filename: str,
        mode: str = "target_size",  # target_size, percentage, quality
        target_size_mb: Optional[float] = None,
        percentage: Optional[float] = None,
        quality: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Compresses audio file using FFmpeg. Calculates optimal audio bitrate
        from duration and target size, or uses VBR quality setting.
        """
        media_info = get_media_info(input_path)
        orig_size = os.path.getsize(input_path)
        duration = max(1.0, media_info.get("duration", 60.0))

        # Determine target bytes
        if mode == "target_size" and target_size_mb is not None:
            target_bytes = int(target_size_mb * 1024 * 1024)
        elif mode == "percentage" and percentage is not None:
            reduction = max(0.05, min(0.95, percentage / 100.0))
            target_bytes = int(orig_size * (1.0 - reduction))
        elif mode == "quality" and quality is not None:
            target_bytes = None
        else:
            target_bytes = int(orig_size * 0.5)

        out_filename = generate_unique_filename(original_filename, prefix="compressed", new_ext=".mp3")
        out_path = str(PROCESSED_DIR / out_filename)

        ffmpeg_args = ["-y", "-i", input_path]

        if target_bytes is not None:
            # Calculate bitrate (kbps)
            target_bitrate_kbps = int((target_bytes * 8) / (duration * 1000))
            # Bound bitrate within useful audio ranges (32k - 320k)
            bitrate_k = max(32, min(320, target_bitrate_kbps))
            ffmpeg_args.extend([
                "-c:a", "libmp3lame",
                "-b:a", f"{bitrate_k}k",
                out_path
            ])
        else:
            # Quality mode: map quality 1-100 to LAME VBR scale 9 (low) to 0 (highest)
            q = quality if quality is not None else 70
            vbr_q = int(9 - ((q / 100.0) * 9))
            ffmpeg_args.extend([
                "-c:a", "libmp3lame",
                "-q:a", str(vbr_q),
                out_path
            ])

        ret, stdout, stderr = run_ffmpeg_command(ffmpeg_args, timeout=300)
        if ret != 0 or not os.path.exists(out_path):
            raise RuntimeError(f"Audio compression failed: {stderr[-500:]}")

        actual_size = os.path.getsize(out_path)
        saved_bytes = max(0, orig_size - actual_size)
        reduction_pct = round((saved_bytes / orig_size) * 100, 1) if orig_size > 0 else 0

        compressed_info = get_media_info(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "compressed_size": actual_size,
            "compressed_size_formatted": format_bytes(actual_size),
            "saved_bytes": saved_bytes,
            "saved_formatted": format_bytes(saved_bytes),
            "reduction_percent": reduction_pct,
            "duration": media_info.get("duration", 0),
            "duration_formatted": media_info.get("duration_formatted", "00:00"),
            "format": "MP3",
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }
