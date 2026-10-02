import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.pdf_advanced_service import PDFAdvancedService
from ..utils.security_utils import validate_and_save_upload

router = APIRouter(prefix="/api/pdf-tools", tags=["PDF Advanced Tools"])


@router.post("/img-to-pdf")
async def convert_images_to_pdf(
    files: List[UploadFile] = File(...)
):
    """Converts one or more uploaded images to a combined PDF document"""
    if not files:
        raise HTTPException(status_code=400, detail="Please upload at least one image.")

    saved_paths = []
    original_names = []
    try:
        for f in files:
            p, orig = await validate_and_save_upload(f, expected_category="image", prefix="up_img2pdf")
            saved_paths.append(str(p))
            original_names.append(orig)

        result = PDFAdvancedService.images_to_pdf(
            image_paths=saved_paths,
            original_filenames=original_names
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image to PDF conversion failed: {str(e)}")
    finally:
        for p in saved_paths:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


@router.post("/pdf-to-word")
async def convert_pdf_to_word(
    file: UploadFile = File(...)
):
    """Converts a PDF file to an editable Microsoft Word .docx document"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_pdf2word")

    try:
        result = PDFAdvancedService.pdf_to_word(
            pdf_path=str(upload_path),
            original_filename=orig_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to Word conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/word-to-pdf")
async def convert_word_to_pdf(
    file: UploadFile = File(...)
):
    """Converts a Microsoft Word (.docx) document to a PDF file"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="document", prefix="up_word2pdf")

    try:
        result = PDFAdvancedService.word_to_pdf(
            docx_path=str(upload_path),
            original_filename=orig_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Word to PDF conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/pdf-to-jpg")
async def convert_pdf_to_jpg(
    file: UploadFile = File(...),
    dpi: int = Form(150)
):
    """Converts PDF pages into JPG images (or ZIP for multi-page)"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_pdf2jpg")

    try:
        result = PDFAdvancedService.pdf_to_jpg(
            pdf_path=str(upload_path),
            original_filename=orig_name,
            dpi=dpi
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to JPG conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/merge")
async def merge_pdf_files(
    files: List[UploadFile] = File(...)
):
    """Merges multiple PDF documents into a single PDF"""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least two PDF documents to merge.")

    saved_paths = []
    original_names = []
    try:
        for f in files:
            p, orig = await validate_and_save_upload(f, expected_category="pdf", prefix="up_merge")
            saved_paths.append(str(p))
            original_names.append(orig)

        result = PDFAdvancedService.merge_pdfs(
            pdf_paths=saved_paths,
            original_filenames=original_names
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF merge failed: {str(e)}")
    finally:
        for p in saved_paths:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass


@router.post("/split")
async def split_pdf_document(
    file: UploadFile = File(...),
    split_mode: str = Form("range"),
    page_range: Optional[str] = Form(None)
):
    """Splits PDF either by extracting specified page ranges or splitting all pages into a ZIP archive"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_split")

    try:
        result = PDFAdvancedService.split_pdf(
            pdf_path=str(upload_path),
            original_filename=orig_name,
            split_mode=split_mode,
            page_range=page_range
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF split failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/pdf-to-excel")
async def convert_pdf_to_excel(
    file: UploadFile = File(...)
):
    """Extracts tables and tabular information from PDF into a styled Excel workbook (.xlsx)"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_pdf2excel")

    try:
        result = PDFAdvancedService.pdf_to_excel(
            pdf_path=str(upload_path),
            original_filename=orig_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to Excel conversion failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/protect")
async def protect_pdf_document(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    """Adds password encryption to a PDF document"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_protect")

    try:
        result = PDFAdvancedService.protect_pdf(
            pdf_path=str(upload_path),
            original_filename=orig_name,
            user_password=password
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF protection failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)


@router.post("/rotate")
async def rotate_pdf_document(
    file: UploadFile = File(...),
    angle: int = Form(90)
):
    """Rotates pages of a PDF document by 90, 180, or 270 degrees"""
    upload_path, orig_name = await validate_and_save_upload(file, expected_category="pdf", prefix="up_rotate")

    try:
        result = PDFAdvancedService.rotate_pdf(
            pdf_path=str(upload_path),
            original_filename=orig_name,
            angle=angle
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF rotation failed: {str(e)}")
    finally:
        if upload_path and upload_path.exists():
            upload_path.unlink(missing_ok=True)
