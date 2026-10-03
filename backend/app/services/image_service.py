import os
import io
import math
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from PIL import Image, ImageOps

from ..utils.file_utils import (
    PROCESSED_DIR,
    generate_unique_filename,
    format_bytes,
    parse_target_size_to_bytes
)

PRESETS = {
    "passport_photo": (413, 531),  # 3.5cm x 4.5cm standard (India, UK, EU, Schengen)
    "passport_2x2": (600, 600),    # 2in x 2in standard (US, OCI, Visa)
    "instagram_post": (1080, 1080),
    "instagram_story": (1080, 1920),
    "youtube_thumbnail": (1280, 720),
    "twitter_header": (1500, 500),
    "linkedin_banner": (1584, 396),
    "facebook_cover": (820, 312),
}


class ImageService:

    @staticmethod
    def inspect_image(file_path: str) -> Dict[str, Any]:
        """Inspects image file and returns dimension, format, and size"""
        file_size = os.path.getsize(file_path)
        with Image.open(file_path) as img:
            width, height = img.size
            img_format = img.format or Path(file_path).suffix.replace(".", "").upper()
            has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)

        return {
            "width": width,
            "height": height,
            "format": img_format,
            "has_alpha": has_alpha,
            "file_size": file_size,
            "file_size_formatted": format_bytes(file_size)
        }

    @staticmethod
    def compress_image(
        input_path: str,
        original_filename: str,
        mode: str = "target_size",  # target_size, percentage, quality
        target_size_mb: Optional[float] = None,
        percentage: Optional[float] = None,
        quality: Optional[int] = None,
        output_format: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compresses image according to target size, percentage reduction, or quality slider.
        Calculates suitable compression settings iteratively to achieve closest target.
        """
        original_size = os.path.getsize(input_path)
        img = Image.open(input_path)
        img = ImageOps.exif_transpose(img)
        orig_w, orig_h = img.size

        # Determine target format
        src_format = (img.format or Path(input_path).suffix.replace(".", "")).upper()
        if output_format:
            fmt = output_format.upper()
        else:
            fmt = "JPEG" if src_format in ["JPG", "JPEG"] else src_format
            if fmt not in ["JPEG", "PNG", "WEBP"]:
                fmt = "JPEG"

        # Determine target bytes
        target_bytes: Optional[int] = None
        if mode == "target_size" and target_size_mb is not None:
            target_bytes = int(target_size_mb * 1024 * 1024)
        elif mode == "percentage" and percentage is not None:
            # e.g. reduce by 70% -> remaining is 30%
            reduction = max(0.05, min(0.95, percentage / 100.0))
            target_bytes = int(original_size * (1.0 - reduction))
        elif mode == "quality" and quality is not None:
            # Direct quality mode
            pass
        else:
            # Default to 75% target of original if unspecified
            target_bytes = int(original_size * 0.5)

        # Prepare image mode for saving (strip alpha if JPEG)
        work_img = img.copy()
        if fmt in ["JPEG", "JPG"] and work_img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", work_img.size, (255, 255, 255))
            if work_img.mode == "P":
                work_img = work_img.convert("RGBA")
            bg.paste(work_img, mask=work_img.split()[3] if len(work_img.split()) == 4 else None)
            work_img = bg
        elif fmt == "WEBP" and work_img.mode not in ("RGB", "RGBA"):
            work_img = work_img.convert("RGBA" if "A" in work_img.mode else "RGB")

        ext = ".jpg" if fmt in ["JPEG", "JPG"] else f".{fmt.lower()}"
        out_filename = generate_unique_filename(original_filename, prefix="compressed", new_ext=ext)
        out_path = PROCESSED_DIR / out_filename

        best_buffer = None
        best_size = original_size
        final_quality = 80
        scale = 1.0

        if mode == "quality" and quality is not None:
            # Directly use chosen quality
            q = max(10, min(100, int(quality)))
            buf = io.BytesIO()
            save_kwargs = {"quality": q, "optimize": True}
            if fmt == "PNG":
                # PNG uses compress_level (1-9)
                save_kwargs = {"compress_level": max(1, min(9, int((100 - q) / 10)))}
            work_img.save(buf, format="JPEG" if fmt in ["JPEG", "JPG"] else fmt, **save_kwargs)
            best_buffer = buf.getvalue()
            best_size = len(best_buffer)
            final_quality = q
        else:
            # Target size or percentage mode: binary search quality & resolution scaling
            target = target_bytes or int(original_size * 0.5)
            # Avoid impossible target
            min_practical_bytes = 10 * 1024  # 10 KB
            target = max(min_practical_bytes, target)

            # Strategy 1: Search quality levels [15..95] at scale 1.0
            low_q, high_q = 15, 95
            closest_diff = float("inf")
            best_img_to_save = work_img

            for current_scale in [1.0, 0.85, 0.70, 0.50, 0.35]:
                scaled_w = max(50, int(orig_w * current_scale))
                scaled_h = max(50, int(orig_h * current_scale))
                if current_scale < 1.0:
                    cand_img = work_img.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
                else:
                    cand_img = work_img

                # Binary search quality on this scale
                q_candidates = [30, 50, 70, 85, 92]
                for q_try in q_candidates:
                    buf = io.BytesIO()
                    save_kwargs = {"quality": q_try, "optimize": True}
                    if fmt == "PNG":
                        save_kwargs = {"compress_level": 9, "optimize": True}
                    cand_img.save(buf, format="JPEG" if fmt in ["JPEG", "JPG"] else fmt, **save_kwargs)
                    sz = buf.tell()

                    diff = abs(sz - target)
                    # We prefer being <= target or close within 10%
                    if sz <= target or diff < closest_diff:
                        closest_diff = diff
                        best_buffer = buf.getvalue()
                        best_size = sz
                        best_img_to_save = cand_img
                        final_quality = q_try
                        scale = current_scale

                    if sz <= target:
                        # Achieved target with this scale!
                        break

                if best_size <= target * 1.05:
                    break

        # Write final bytes
        with open(out_path, "wb") as f:
            f.write(best_buffer if best_buffer else b"")

        actual_size = os.path.getsize(out_path)
        saved_bytes = max(0, original_size - actual_size)
        reduction_pct = round((saved_bytes / original_size) * 100, 1) if original_size > 0 else 0

        note = None
        if target_bytes and actual_size > target_bytes * 1.15:
            note = f"The closest practical size is {format_bytes(actual_size)} while preserving reasonable visual clarity."

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "original_size": original_size,
            "original_size_formatted": format_bytes(original_size),
            "compressed_size": actual_size,
            "compressed_size_formatted": format_bytes(actual_size),
            "saved_bytes": saved_bytes,
            "saved_formatted": format_bytes(saved_bytes),
            "reduction_percent": reduction_pct,
            "quality": final_quality,
            "scale": scale,
            "width": orig_w,
            "height": orig_h,
            "format": fmt,
            "note": note,
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }

    @staticmethod
    def resize_image(
        input_path: str,
        original_filename: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        lock_aspect_ratio: bool = True,
        preset: Optional[str] = None
    ) -> Dict[str, Any]:
        """Resizes image according to exact dimensions or social media presets"""
        original_size = os.path.getsize(input_path)
        img = Image.open(input_path)
        img = ImageOps.exif_transpose(img)
        orig_w, orig_h = img.size

        target_w, target_h = width, height

        if preset and preset in PRESETS:
            target_w, target_h = PRESETS[preset]
        elif not target_w and not target_h:
            target_w, target_h = orig_w, orig_h
        elif target_w and not target_h:
            target_h = int(orig_h * (target_w / orig_w)) if lock_aspect_ratio else orig_h
        elif target_h and not target_w:
            target_w = int(orig_w * (target_h / orig_h)) if lock_aspect_ratio else orig_w
        elif lock_aspect_ratio:
            # Maintain aspect ratio to fit inside target box
            ratio = min(target_w / orig_w, target_h / orig_h)
            target_w = max(1, int(orig_w * ratio))
            target_h = max(1, int(orig_h * ratio))

        target_w = max(1, int(target_w))
        target_h = max(1, int(target_h))

        resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)

        ext = Path(input_path).suffix.lower() or ".jpg"
        out_filename = generate_unique_filename(original_filename, prefix="resized", new_ext=ext)
        out_path = PROCESSED_DIR / out_filename

        save_kwargs = {}
        if ext in [".jpg", ".jpeg"]:
            if resized.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", resized.size, (255, 255, 255))
                if resized.mode == "P":
                    resized = resized.convert("RGBA")
                if "A" in resized.mode:
                    bg.paste(resized, mask=resized.split()[-1])
                else:
                    bg.paste(resized)
                resized = bg
            elif resized.mode != "RGB":
                resized = resized.convert("RGB")
            save_kwargs = {"quality": 95, "optimize": True}
        elif ext == ".png":
            save_kwargs = {"optimize": True}
        elif ext == ".webp":
            save_kwargs = {"quality": 95}

        resized.save(out_path, **save_kwargs)

        new_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "original_width": orig_w,
            "original_height": orig_h,
            "new_width": target_w,
            "new_height": target_h,
            "original_size": original_size,
            "original_size_formatted": format_bytes(original_size),
            "new_size": new_size,
            "new_size_formatted": format_bytes(new_size),
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }

    @staticmethod
    def convert_image(
        input_path: str,
        original_filename: str,
        target_format: str,
        quality: int = 90
    ) -> Dict[str, Any]:
        """Converts image between JPG, PNG, WEBP, BMP, etc."""
        original_size = os.path.getsize(input_path)
        img = Image.open(input_path)
        img = ImageOps.exif_transpose(img)

        target_ext = target_format.lower().replace(".", "")
        if target_ext in ["jpg", "jpeg"]:
            target_ext = "jpg"
            save_format = "JPEG"
        elif target_ext == "png":
            save_format = "PNG"
        elif target_ext == "webp":
            save_format = "WEBP"
        elif target_ext == "bmp":
            save_format = "BMP"
        else:
            save_format = target_ext.upper()

        # Handle alpha channel
        work_img = img
        if save_format in ["JPEG", "BMP"] and img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                work_img = img.convert("RGBA")
            bg.paste(work_img, mask=work_img.split()[3] if len(work_img.split()) == 4 else None)
            work_img = bg
        elif save_format == "WEBP" and img.mode not in ("RGB", "RGBA"):
            work_img = img.convert("RGBA" if "A" in img.mode else "RGB")

        out_filename = generate_unique_filename(original_filename, prefix="converted", new_ext=f".{target_ext}")
        out_path = PROCESSED_DIR / out_filename

        save_kwargs = {}
        if save_format in ["JPEG", "WEBP"]:
            save_kwargs = {"quality": quality, "optimize": True}
        elif save_format == "PNG":
            save_kwargs = {"optimize": True}

        work_img.save(out_path, format=save_format, **save_kwargs)
        new_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "original_format": img.format or Path(input_path).suffix.replace(".", "").upper(),
            "target_format": target_ext.upper(),
            "original_size": original_size,
            "original_size_formatted": format_bytes(original_size),
            "new_size": new_size,
            "new_size_formatted": format_bytes(new_size),
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }
