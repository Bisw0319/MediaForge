import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.pdf_service import PDFService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/pdf", tags=["PDF"])


@router.post("/inspect")
async def inspect_pdf(file: UploadFile = File(...)):
    """Inspects PDF document metadata and page count"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="inspect_pdf")

    try:
        info = PDFService.inspect_pdf(str(upload_path))
        info["original_filename"] = orig_name
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect PDF: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    mode: str = Form("recommended"),
    target_size_mb: Optional[float] = Form(None)
):
    """Compresses PDF document using recommended, maximum, or custom target size modes"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="upload_pdf")

    try:
        result = PDFService.compress_pdf(
            input_path=str(upload_path),
            original_filename=orig_name,
            mode=mode,
            target_size_mb=target_size_mb
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compression failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
