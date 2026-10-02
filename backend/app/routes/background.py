import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.background_service import BackgroundService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/background", tags=["Background"])


@router.post("/remove")
async def remove_background(
    file: UploadFile = File(...),
    bg_type: str = Form("transparent"),
    custom_color: Optional[str] = Form(None),
    gradient_theme: Optional[str] = Form(None),
    model_type: Optional[str] = Form("human")
):
    """
    Removes background from image using AI model.
    Optionally composites cutout onto solid color or gradient background.
    """
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="image", prefix="upload_bg")

    try:
        result = BackgroundService.remove_background(
            input_path=str(upload_path),
            original_filename=orig_name,
            bg_type=bg_type,
            custom_color=custom_color,
            gradient_theme=gradient_theme,
            model_type=model_type or "human"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
