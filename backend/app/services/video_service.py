import os
import math
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


class VideoService:

    @staticmethod
    def inspect_video(file_path: str) -> Dict[str, Any]:
        """Inspects video file metadata"""
        info = get_media_info(file_path)
        info["original_size"] = os.path.getsize(file_path)
        info["original_size_formatted"] = format_bytes(info["original_size"])
        return info

    @staticmethod
    def compress_video(
        input_path: str,
        original_filename: str,
        mode: str = "target_size",  # target_size, percentage, quality
        target_size_mb: Optional[float] = None,
        percentage: Optional[float] = None,
        quality: Optional[int] = None,
        preset: str = "medium"
    ) -> Dict[str, Any]:
        """
        Compresses video using FFmpeg by calculating optimal video and audio bitrates
        based on duration and target size. Intelligently scales resolution when appropriate.
        """
        media_info = get_media_info(input_path)
        orig_size = os.path.getsize(input_path)
        duration = max(1.0, media_info.get("duration", 10.0))
        orig_w = media_info.get("width", 1920) or 1920
        orig_h = media_info.get("height", 1080) or 1080

        # Calculate target bytes
        if mode == "target_size" and target_size_mb is not None:
            target_bytes = int(target_size_mb * 1024 * 1024)
        elif mode == "percentage" and percentage is not None:
            reduction = max(0.05, min(0.95, percentage / 100.0))
            target_bytes = int(orig_size * (1.0 - reduction))
        elif mode == "quality" and quality is not None:
            # Map quality (1-100) to CRF (51 to 18)
            crf = int(51 - ((quality / 100.0) * 33))
            target_bytes = None
        else:
            target_bytes = int(orig_size * 0.5)

        out_filename = generate_unique_filename(original_filename, prefix="compressed", new_ext=".mp4")
        out_path = str(PROCESSED_DIR / out_filename)

        ffmpeg_args = ["-y", "-i", input_path]

        # Resolution scaling filter logic
        vf_filters = []

        if target_bytes is not None:
            # Calculate total bitrate in kilobits per second
            total_bitrate_kbps = int((target_bytes * 8) / (duration * 1000))
            # Reserve 10% safety margin for container overhead
            effective_bitrate = int(total_bitrate_kbps * 0.90)

            # Audio bitrate allocation
            if effective_bitrate < 300:
                audio_bitrate_k = 64
            elif effective_bitrate < 800:
                audio_bitrate_k = 96
            else:
                audio_bitrate_k = 128

            video_bitrate_k = max(100, effective_bitrate - audio_bitrate_k)

            # Auto downscale resolution if bitrate is low to avoid compression artifacts
            target_h = orig_h
            if video_bitrate_k < 400 and orig_h > 480:
                target_h = 480
            elif video_bitrate_k < 900 and orig_h > 720:
                target_h = 720
            elif video_bitrate_k < 1800 and orig_h > 1080:
                target_h = 1080

            if target_h < orig_h:
                # scale preserving aspect ratio, ensure even dimensions for h264
                vf_filters.append(f"scale=-2:{target_h}")

            if vf_filters:
                ffmpeg_args.extend(["-vf", ",".join(vf_filters)])

            ffmpeg_args.extend([
                "-c:v", "libx264",
                "-b:v", f"{video_bitrate_k}k",
                "-maxrate", f"{int(video_bitrate_k * 1.35)}k",
                "-bufsize", f"{int(video_bitrate_k * 2)}k",
                "-preset", preset,
                "-c:a", "aac",
                "-b:a", f"{audio_bitrate_k}k",
                "-movflags", "+faststart",
                out_path
            ])
        else:
            # Quality mode using CRF
            # crf ranges: 18 (visually lossless) to 40 (heavy compression)
            crf = crf if 'crf' in locals() else 28
            ffmpeg_args.extend([
                "-c:v", "libx264",
                "-crf", str(crf),
                "-preset", preset,
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",
                out_path
            ])

        ret, stdout, stderr = run_ffmpeg_command(ffmpeg_args, timeout=600)
        if ret != 0 or not os.path.exists(out_path):
            raise RuntimeError(f"Video compression failed: {stderr[-500:]}")

        actual_size = os.path.getsize(out_path)
        saved_bytes = max(0, orig_size - actual_size)
        reduction_pct = round((saved_bytes / orig_size) * 100, 1) if orig_size > 0 else 0

        note = None
        if target_bytes and actual_size > target_bytes * 1.15:
            note = f"The closest practical size is {format_bytes(actual_size)} while preserving smooth playback."

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
            "resolution": f"{compressed_info.get('width', orig_w)}x{compressed_info.get('height', orig_h)}",
            "format": "MP4",
            "note": note,
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }

    @staticmethod
    def convert_video(
        input_path: str,
        original_filename: str,
        target_format: str
    ) -> Dict[str, Any]:
        """Converts video to MP4, WEBM, MOV, MKV, AVI, or GIF"""
        orig_size = os.path.getsize(input_path)
        target_ext = target_format.lower().replace(".", "")

        out_filename = generate_unique_filename(original_filename, prefix="converted", new_ext=f".{target_ext}")
        out_path = str(PROCESSED_DIR / out_filename)

        ffmpeg_args = ["-y", "-i", input_path]

        media_info = get_media_info(input_path)
        has_audio = media_info.get("has_audio", False)

        if target_ext == "gif":
            # High quality palette-based GIF conversion (capped at 15s to keep GIF lightweight and responsive)
            ffmpeg_args.extend([
                "-t", "15",
                "-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
                "-loop", "0",
                out_path
            ])
        elif target_ext == "webm":
            ffmpeg_args.extend([
                "-c:v", "libvpx-vp9",
                "-pix_fmt", "yuv420p",
                "-crf", "32",
                "-b:v", "0",
                "-cpu-used", "4",
                "-row-mt", "1"
            ])
            if has_audio:
                ffmpeg_args.extend(["-c:a", "libopus", "-b:a", "96k"])
            else:
                ffmpeg_args.extend(["-an"])
            ffmpeg_args.append(out_path)
        elif target_ext == "mp4":
            ffmpeg_args.extend([
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "fast",
                "-crf", "23"
            ])
            if has_audio:
                ffmpeg_args.extend(["-c:a", "aac", "-b:a", "128k"])
            else:
                ffmpeg_args.extend(["-an"])
            ffmpeg_args.extend(["-movflags", "+faststart", out_path])
        elif target_ext in ["mov", "mkv", "avi"]:
            ffmpeg_args.extend([
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "fast",
                "-crf", "23"
            ])
            if has_audio:
                ffmpeg_args.extend(["-c:a", "aac", "-b:a", "128k"])
            else:
                ffmpeg_args.extend(["-an"])
            ffmpeg_args.append(out_path)
        else:
            ffmpeg_args.extend([
                "-c:v", "libx264",
                "-pix_fmt", "yuv420p",
                "-preset", "fast",
                "-crf", "23"
            ])
            if has_audio:
                ffmpeg_args.extend(["-c:a", "aac"])
            else:
                ffmpeg_args.extend(["-an"])
            ffmpeg_args.append(out_path)

        ret, stdout, stderr = run_ffmpeg_command(ffmpeg_args, timeout=600)
        if ret != 0 or not os.path.exists(out_path):
            raise RuntimeError(f"Video conversion failed: {stderr[-500:]}")

        new_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "target_format": target_ext.upper(),
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "new_size": new_size,
            "new_size_formatted": format_bytes(new_size),
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }
