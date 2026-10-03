import os
import asyncio
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.image_service import ImageService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/image", tags=["Image"])


@router.post("/inspect")
async def inspect_image(file: UploadFile = File(...)):
    """Inspects uploaded image to return dimensions, format, and size"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="inspect")
    try:
        info = await asyncio.to_thread(ImageService.inspect_image, str(upload_path))
        info["original_filename"] = orig_name
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect image: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    mode: str = Form("target_size"),
    target_size_mb: Optional[float] = Form(None),
    percentage: Optional[float] = Form(None),
    quality: Optional[int] = Form(None),
    output_format: Optional[str] = Form(None)
):
    """Compresses a single image file to target size, percentage reduction, or quality slider"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="upload")

    try:
        result = await asyncio.to_thread(
            ImageService.compress_image,
            input_path=str(upload_path),
            original_filename=orig_name,
            mode=mode,
            target_size_mb=target_size_mb,
            percentage=percentage,
            quality=quality,
            output_format=output_format
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image compression failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/compress-batch")
async def compress_image_batch(
    files: List[UploadFile] = File(...),
    mode: str = Form("target_size"),
    target_size_mb: Optional[float] = Form(None),
    percentage: Optional[float] = Form(None),
    quality: Optional[int] = Form(None),
    output_format: Optional[str] = Form(None)
):
    """Processes multiple images in batch, returning individual results and summary"""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    results = []
    total_original = 0
    total_compressed = 0

    for file in files:
        upload_path = None
        orig_name = file.filename or "image.jpg"
        try:
            upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="upload_batch")

            item_res = ImageService.compress_image(
                input_path=str(upload_path),
                original_filename=orig_name,
                mode=mode,
                target_size_mb=target_size_mb,
                percentage=percentage,
                quality=quality,
                output_format=output_format
            )
            results.append(item_res)
            total_original += item_res["original_size"]
            total_compressed += item_res["compressed_size"]
        except Exception as e:
            results.append({
                "success": False,
                "original_filename": orig_name,
                "error": str(e)
            })
        finally:
            if upload_path and upload_path.exists():
                upload_path.unlink(missing_ok=True)

    total_saved = max(0, total_original - total_compressed)
    total_pct = round((total_saved / total_original) * 100, 1) if total_original > 0 else 0

    return {
        "success": True,
        "count": len(files),
        "results": results,
        "total_original_size": total_original,
        "total_compressed_size": total_compressed,
        "total_saved_bytes": total_saved,
        "total_reduction_percent": total_pct
    }


@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    lock_aspect_ratio: bool = Form(True),
    preset: Optional[str] = Form(None)
):
    """Resizes image to specific dimensions or social media presets"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="upload_resize")

    try:
        result = ImageService.resize_image(
            input_path=str(upload_path),
            original_filename=orig_name,
            width=width,
            height=height,
            lock_aspect_ratio=lock_aspect_ratio,
            preset=preset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image resizing failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: str = Form("WEBP"),
    quality: int = Form(90)
):
    """Converts image between formats (JPG, PNG, WEBP, BMP, etc.)"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="upload_convert")

    try:
        result = ImageService.convert_image(
            input_path=str(upload_path),
            original_filename=orig_name,
            target_format=target_format,
            quality=quality
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
