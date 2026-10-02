import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.video_service import VideoService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/video", tags=["Video"])


@router.post("/inspect")
async def inspect_video(file: UploadFile = File(...)):
    """Inspects video metadata including duration, resolution, codecs, and size"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="video", prefix="inspect_video")

    try:
        info = VideoService.inspect_video(str(upload_path))
        info["original_filename"] = orig_name
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect video: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/compress")
async def compress_video(
    file: UploadFile = File(...),
    mode: str = Form("target_size"),
    target_size_mb: Optional[float] = Form(None),
    percentage: Optional[float] = Form(None),
    quality: Optional[int] = Form(None),
    preset: str = Form("medium")
):
    """Compresses video according to target size, percentage reduction, or quality CRF"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="video", prefix="upload_video")

    try:
        result = VideoService.compress_video(
            input_path=str(upload_path),
            original_filename=orig_name,
            mode=mode,
            target_size_mb=target_size_mb,
            percentage=percentage,
            quality=quality,
            preset=preset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video compression failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/convert")
async def convert_video(
    file: UploadFile = File(...),
    target_format: str = Form("MP4")
):
    """Converts video format between MP4, WEBM, MOV, MKV, AVI, or GIF"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="video", prefix="upload_vconvert")

    try:
        result = VideoService.convert_video(
            input_path=str(upload_path),
            original_filename=orig_name,
            target_format=target_format
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
