import os
import shutil
from pathlib import Path
from typing import Optional, Dict, Any
import pymupdf as fitz
from PIL import Image
import io

from ..utils.file_utils import (
    PROCESSED_DIR,
    generate_unique_filename,
    format_bytes
)


class PDFService:

    @staticmethod
    def inspect_pdf(file_path: str) -> Dict[str, Any]:
        """Inspects PDF and returns page count and file size"""
        file_size = os.path.getsize(file_path)
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            title = doc.metadata.get("title", "")
            doc.close()
        except Exception as e:
            page_count = 1
            title = ""

        return {
            "page_count": page_count,
            "title": title,
            "file_size": file_size,
            "file_size_formatted": format_bytes(file_size)
        }

    @staticmethod
    def compress_pdf(
        input_path: str,
        original_filename: str,
        mode: str = "recommended",  # recommended, maximum, custom
        target_size_mb: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Compresses PDF documents using PyMuPDF stream deflation, garbage collection,
        font optimization, and intelligent embedded image re-encoding.
        """
        orig_size = os.path.getsize(input_path)
        out_filename = generate_unique_filename(original_filename, prefix="compressed", new_ext=".pdf")
        out_path = str(PROCESSED_DIR / out_filename)

        doc = fitz.open(input_path)
        page_count = len(doc)

        # Compression configuration
        if mode == "maximum":
            img_quality = 40
            max_img_dim = 1000
        elif mode == "custom" and target_size_mb is not None:
            target_bytes = int(target_size_mb * 1024 * 1024)
            ratio = target_bytes / max(1, orig_size)
            if ratio < 0.4:
                img_quality = 35
                max_img_dim = 900
            elif ratio < 0.7:
                img_quality = 55
                max_img_dim = 1200
            else:
                img_quality = 75
                max_img_dim = 1600
        else:  # recommended
            img_quality = 70
            max_img_dim = 1500

        # Optimize embedded images across pages
        processed_xrefs = set()
        for page in doc:
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                if xref in processed_xrefs:
                    continue
                processed_xrefs.add(xref)

                try:
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]

                    # Open image in Pillow for optimization
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    w, h = pil_img.size

                    # Downsample if dimensions exceed max_img_dim
                    needs_resize = w > max_img_dim or h > max_img_dim
                    if needs_resize:
                        scale = min(max_img_dim / w, max_img_dim / h)
                        new_w = max(1, int(w * scale))
                        new_h = max(1, int(h * scale))
                        pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

                    # Compress to JPEG
                    out_img_buf = io.BytesIO()
                    if pil_img.mode in ("RGBA", "P"):
                        pil_img = pil_img.convert("RGB")
                    pil_img.save(out_img_buf, format="JPEG", quality=img_quality, optimize=True)
                    new_img_bytes = out_img_buf.getvalue()

                    # Only replace if newly compressed bytes are smaller
                    if len(new_img_bytes) < len(image_bytes):
                        doc.update_stream(xref, new_img_bytes)
                except Exception:
                    # Keep original image if stream cannot be replaced
                    continue

        # Save with maximal PyMuPDF deflation & object scrubbing
        doc.save(
            out_path,
            garbage=4,             # Eliminate unused objects
            clean=True,            # Clean and sanitize streams
            deflate=True,          # Deflate all uncompressed streams
            deflate_images=True,   # Deflate image streams
            deflate_fonts=True,    # Deflate font streams
        )
        doc.close()

        actual_size = os.path.getsize(out_path)
        # In case optimization resulted in larger file (e.g. already hyper-compressed PDF),
        # fallback to copying original or keeping best
        if actual_size >= orig_size:
            shutil.copy2(input_path, out_path)
            actual_size = orig_size

        saved_bytes = max(0, orig_size - actual_size)
        reduction_pct = round((saved_bytes / orig_size) * 100, 1) if orig_size > 0 else 0

        return {
            "success": True,
            "filename": out_filename,
            "original_filename": original_filename,
            "page_count": page_count,
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "compressed_size": actual_size,
            "compressed_size_formatted": format_bytes(actual_size),
            "saved_bytes": saved_bytes,
            "saved_formatted": format_bytes(saved_bytes),
            "reduction_percent": reduction_pct,
            "mode": mode,
            "download_url": f"/api/files/download/{out_filename}",
            "preview_url": f"/api/files/preview/{out_filename}"
        }
