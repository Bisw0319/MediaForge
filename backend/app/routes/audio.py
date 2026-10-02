import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.audio_service import AudioService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/audio", tags=["Audio"])


@router.post("/inspect")
async def inspect_audio(file: UploadFile = File(...)):
    """Inspects audio metadata including duration, bitrate, and size"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="audio", prefix="inspect_audio")

    try:
        info = AudioService.inspect_audio(str(upload_path))
        info["original_filename"] = orig_name
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect audio: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/compress")
async def compress_audio(
    file: UploadFile = File(...),
    mode: str = Form("target_size"),
    target_size_mb: Optional[float] = Form(None),
    percentage: Optional[float] = Form(None),
    quality: Optional[int] = Form(None)
):
    """Compresses audio file to desired target size, percentage reduction, or quality level"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="audio", prefix="upload_audio")

    try:
        result = AudioService.compress_audio(
            input_path=str(upload_path),
            original_filename=orig_name,
            mode=mode,
            target_size_mb=target_size_mb,
            percentage=percentage,
            quality=quality
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio compression failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
