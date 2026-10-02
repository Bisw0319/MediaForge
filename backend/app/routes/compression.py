import os
import shutil
import zipfile
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..utils.file_utils import (
    TEMP_DIR,
    PROCESSED_DIR,
    UPLOADS_DIR,
    ARCHIVES_DIR,
    format_bytes,
    create_zip_archive,
    sanitize_filename,
    generate_unique_filename
)
from ..utils.cleanup_utils import delete_specific_file
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api", tags=["General"])


class EstimateRequest(BaseModel):
    file_type: str  # image, video, pdf, audio
    original_size: int
    mode: str       # target_size, percentage, quality
    target_size_mb: Optional[float] = None
    percentage: Optional[float] = None
    quality: Optional[int] = None
    duration: Optional[float] = None


class MultiZipRequest(BaseModel):
    filenames: List[str]
    archive_name: Optional[str] = "mediaforge_compressed.zip"


@router.post("/compression/estimate")
async def estimate_compression(req: EstimateRequest):
    """
    Calculates estimated compressed size and reduction percentage
    without altering the file, warning if target is aggressively small.
    """
    orig = req.original_size
    mode = req.mode
    est_bytes = orig

    if mode == "target_size" and req.target_size_mb is not None:
        raw_target = int(req.target_size_mb * 1024 * 1024)
        # Apply sanity boundaries based on media type
        if req.file_type == "video" and req.duration:
            # Min 100 kbps for audio+video
            min_bytes = int((100 * 1000 / 8) * req.duration)
            est_bytes = max(min_bytes, raw_target)
        elif req.file_type == "image":
            min_bytes = 15 * 1024  # 15 KB minimum reasonable
            est_bytes = max(min_bytes, raw_target)
        elif req.file_type == "audio" and req.duration:
            min_bytes = int((32 * 1000 / 8) * req.duration)
            est_bytes = max(min_bytes, raw_target)
        elif req.file_type == "pdf":
            est_bytes = max(int(orig * 0.2), raw_target)
        else:
            est_bytes = raw_target
    elif mode == "percentage" and req.percentage is not None:
        pct = max(5.0, min(95.0, req.percentage))
        est_bytes = int(orig * (1.0 - (pct / 100.0)))
    elif mode == "quality" and req.quality is not None:
        q = max(10, min(100, req.quality))
        ratio = 0.15 + (q / 100.0) * 0.75
        est_bytes = int(orig * ratio)
    else:
        est_bytes = int(orig * 0.5)

    est_bytes = min(orig, est_bytes)
    saved = max(0, orig - est_bytes)
    pct_saved = round((saved / orig) * 100, 1) if orig > 0 else 0

    note = None
    if est_bytes > 0 and (orig / est_bytes) > 10:
        note = "Aggressive compression requested. MediaForge will balance reduction with visual clarity."

    return {
        "original_size": orig,
        "original_formatted": format_bytes(orig),
        "estimated_size": est_bytes,
        "estimated_formatted": format_bytes(est_bytes),
        "estimated_reduction_percent": pct_saved,
        "note": note
    }


@router.post("/compression/multi-zip")
async def create_multi_zip(req: MultiZipRequest):
    """Packages multiple processed files into a single ZIP for batch download"""
    if not req.filenames:
        raise HTTPException(status_code=400, detail="No files provided for ZIP archive.")

    files_to_zip = []
    for fn in req.filenames:
        clean_fn = Path(fn).name
        target_path = PROCESSED_DIR / clean_fn
        if target_path.exists():
            files_to_zip.append((str(target_path), clean_fn))

    if not files_to_zip:
        raise HTTPException(status_code=404, detail="None of the specified files were found.")

    archive_filename = f"mediaforge_batch_{os.urandom(4).hex()}.zip"
    zip_path = create_zip_archive(files_to_zip, archive_filename)

    return {
        "success": True,
        "archive_filename": archive_filename,
        "total_files": len(files_to_zip),
        "archive_size": os.path.getsize(zip_path),
        "archive_size_formatted": format_bytes(os.path.getsize(zip_path)),
        "download_url": f"/api/files/download/{archive_filename}"
    }


@router.post("/compression/create-zip")
async def create_user_zip(
    files: List[UploadFile] = File(...),
    archive_name: Optional[str] = Form("mediaforge_archive.zip")
):
    """Packages directly uploaded user files into a compressed ZIP archive"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded to create ZIP archive.")

    clean_archive_name = sanitize_filename(archive_name or "archive.zip")
    if not clean_archive_name.lower().endswith(".zip"):
        clean_archive_name += ".zip"

    unique_zip_name = f"{Path(clean_archive_name).stem}_{os.urandom(4).hex()}.zip"
    zip_path = ARCHIVES_DIR / unique_zip_name

    total_uncompressed = 0
    saved_temp_files = []

    try:
        with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for file in files:
                temp_path, orig_name = await validate_and_save_upload(
                    file,
                    expected_category="any_media",
                    prefix="zipupload"
                )
                saved_temp_files.append(temp_path)
                file_sz = os.path.getsize(temp_path)
                total_uncompressed += file_sz

                zf.write(str(temp_path), arcname=orig_name)

        archive_size = os.path.getsize(zip_path)
        saved_bytes = max(0, total_uncompressed - archive_size)
        reduction_pct = round((saved_bytes / total_uncompressed) * 100, 1) if total_uncompressed > 0 else 0

        return {
            "success": True,
            "archive_filename": unique_zip_name,
            "display_name": clean_archive_name,
            "file_count": len(files),
            "original_size": total_uncompressed,
            "original_size_formatted": format_bytes(total_uncompressed),
            "compressed_size": archive_size,
            "compressed_size_formatted": format_bytes(archive_size),
            "saved_bytes": saved_bytes,
            "saved_formatted": format_bytes(saved_bytes),
            "reduction_percent": reduction_pct,
            "download_url": f"/api/files/download/{unique_zip_name}"
        }
    finally:
        for p in saved_temp_files:
            if p.exists():
                p.unlink(missing_ok=True)


@router.get("/files/download/{filename}")
@router.get("/download/{filename}")
async def download_file(filename: str, background_tasks: BackgroundTasks, cleanup: bool = False):
    """Streams file download with attachment header and security headers"""
    clean_name = Path(filename).name
    # Search in processed, archives, or uploads
    file_path = None
    for folder in [PROCESSED_DIR, ARCHIVES_DIR, UPLOADS_DIR]:
        candidate = folder / clean_name
        if candidate.exists() and candidate.is_file():
            file_path = candidate
            break

    if not file_path or not file_path.resolve().is_relative_to(TEMP_DIR.resolve()):
        raise HTTPException(status_code=404, detail="Requested file was not found or has expired.")

    if cleanup:
        background_tasks.add_task(delete_specific_file, str(file_path))

    return FileResponse(
        path=str(file_path),
        filename=clean_name,
        media_type="application/octet-stream",
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'",
            "X-Frame-Options": "DENY"
        }
    )


@router.get("/files/preview/{filename}")
async def preview_file(filename: str):
    """Streams file for inline browser viewing/listening with security headers"""
    clean_name = Path(filename).name
    file_path = None
    for folder in [PROCESSED_DIR, UPLOADS_DIR]:
        candidate = folder / clean_name
        if candidate.exists() and candidate.is_file():
            file_path = candidate
            break

    if not file_path or not file_path.resolve().is_relative_to(TEMP_DIR.resolve()):
        raise HTTPException(status_code=404, detail="File not found")

    ext = file_path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".pdf": "application/pdf"
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'",
            "X-Frame-Options": "DENY"
        }
    )


@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """Deletes temporary file after user is finished"""
    clean_name = Path(filename).name
    deleted = False
    for folder in [PROCESSED_DIR, UPLOADS_DIR, ARCHIVES_DIR]:
        cand = folder / clean_name
        if cand.exists():
            delete_specific_file(str(cand))
            deleted = True
            break
    return {"success": deleted}
