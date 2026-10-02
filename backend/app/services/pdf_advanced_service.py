import os
import io
import zipfile
from pathlib import Path
from typing import List, Optional, Dict, Any
import pymupdf as fitz
from PIL import Image, ImageOps
import docx
from docx.shared import Inches, Pt, RGBColor
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from ..utils.file_utils import (
    PROCESSED_DIR,
    generate_unique_filename,
    format_bytes
)


class PDFAdvancedService:

    @staticmethod
    def images_to_pdf(
        image_paths: List[str],
        original_filenames: List[str],
        margin: int = 0
    ) -> Dict[str, Any]:
        """
        Converts one or multiple images (JPG, PNG, WEBP, BMP) into a single PDF.
        """
        if not image_paths:
            raise ValueError("No images provided for conversion.")

        doc = fitz.open()
        total_input_bytes = sum(os.path.getsize(p) for p in image_paths)

        first_name = Path(original_filenames[0]).stem if original_filenames else "converted_images"
        out_filename = generate_unique_filename(f"{first_name}.pdf", prefix="img2pdf", new_ext=".pdf")
        out_path = PROCESSED_DIR / out_filename

        for img_path in image_paths:
            with Image.open(img_path) as pil_img:
                pil_img = ImageOps.exif_transpose(pil_img)
                # Convert palette or transparency to RGB
                if pil_img.mode in ("RGBA", "LA", "P"):
                    bg = Image.new("RGB", pil_img.size, (255, 255, 255))
                    if pil_img.mode == "P":
                        pil_img = pil_img.convert("RGBA")
                    if "A" in pil_img.mode:
                        bg.paste(pil_img, mask=pil_img.split()[-1])
                    else:
                        bg.paste(pil_img)
                    pil_img = bg
                elif pil_img.mode != "RGB":
                    pil_img = pil_img.convert("RGB")

                img_w, img_h = pil_img.size
                img_byte_arr = io.BytesIO()
                pil_img.save(img_byte_arr, format="JPEG", quality=95, optimize=True)
                img_bytes = img_byte_arr.getvalue()

            # Create PDF page matching exact image dimensions and embed image natively
            page = doc.new_page(width=img_w, height=img_h)
            page.insert_image(fitz.Rect(0, 0, img_w, img_h), stream=img_bytes)

        doc.save(str(out_path), garbage=3, deflate=True)
        doc.close()

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": total_input_bytes,
            "original_size_formatted": format_bytes(total_input_bytes),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "pages_count": len(image_paths),
            "tool": "img-to-pdf"
        }

    @staticmethod
    def pdf_to_word(
        pdf_path: str,
        original_filename: str
    ) -> Dict[str, Any]:
        """
        Extracts structured text, paragraphs, and headings from PDF into a styled .docx Word document.
        """
        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        out_filename = generate_unique_filename(f"{base_name}.docx", prefix="pdf2word", new_ext=".docx")
        out_path = PROCESSED_DIR / out_filename

        doc = fitz.open(pdf_path)
        word_doc = docx.Document()

        # Set standard margins
        sections = word_doc.sections
        for section in sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1)
            section.right_margin = Inches(1)

        page_count = len(doc)
        total_blocks = 0

        for page_idx, page in enumerate(doc):
            if page_idx > 0:
                word_doc.add_page_break()

            # Extract blocks of text (x0, y0, x1, y1, text, block_no, block_type)
            blocks = page.get_text("blocks")
            for b in blocks:
                # b[4] is text, b[6] is block_type (0 = text, 1 = image)
                if b[6] == 0:
                    text = b[4].strip()
                    if not text:
                        continue
                    total_blocks += 1
                    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
                    full_para = " ".join(lines)

                    # Simple heuristic: if short line and capitalized, make it a heading
                    if len(lines) == 1 and len(lines[0]) < 60 and not lines[0].endswith("."):
                        h = word_doc.add_heading(lines[0], level=2)
                        h.paragraph_format.space_before = Pt(8)
                        h.paragraph_format.space_after = Pt(4)
                    else:
                        p = word_doc.add_paragraph(full_para)
                        p.paragraph_format.space_after = Pt(6)
                        p.paragraph_format.line_spacing = 1.15

        doc.close()
        word_doc.save(str(out_path))

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "pages_count": page_count,
            "blocks_extracted": total_blocks,
            "tool": "pdf-to-word"
        }

    @staticmethod
    def word_to_pdf(
        docx_path: str,
        original_filename: str
    ) -> Dict[str, Any]:
        """
        Converts .docx Word document to PDF using python-docx and PyMuPDF text layout engine.
        """
        orig_size = os.path.getsize(docx_path)
        base_name = Path(original_filename).stem
        out_filename = generate_unique_filename(f"{base_name}.pdf", prefix="word2pdf", new_ext=".pdf")
        out_path = PROCESSED_DIR / out_filename

        word_doc = docx.Document(docx_path)
        pdf_doc = fitz.open()

        # Standard A4 dimensions in points: 595.3 x 841.9
        PAGE_W = 595.3
        PAGE_H = 841.9
        MARGIN_X = 54.0   # 0.75 in
        MARGIN_TOP = 54.0
        MARGIN_BOTTOM = 54.0
        MAX_TEXT_W = PAGE_W - (2 * MARGIN_X)

        current_page = pdf_doc.new_page(width=PAGE_W, height=PAGE_H)
        current_y = MARGIN_TOP

        for para in word_doc.paragraphs:
            text = para.text.strip()
            if not text:
                current_y += 10
                continue

            # Determine styling based on style name
            style_name = para.style.name.lower() if para.style else ""
            if "heading 1" in style_name:
                font_size = 18.0
                line_height = 24.0
                current_y += 12.0
            elif "heading 2" in style_name:
                font_size = 14.0
                line_height = 20.0
                current_y += 8.0
            elif "heading" in style_name:
                font_size = 12.0
                line_height = 18.0
                current_y += 6.0
            else:
                font_size = 10.5
                line_height = 15.0

            # Wrap text to fit page width
            words = text.split(" ")
            current_line = []

            for word in words:
                test_line = " ".join(current_line + [word])
                # Approx text length calculation
                approx_width = len(test_line) * (font_size * 0.52)
                if approx_width > MAX_TEXT_W and current_line:
                    # Print current line
                    if current_y + line_height > (PAGE_H - MARGIN_BOTTOM):
                        current_page = pdf_doc.new_page(width=PAGE_W, height=PAGE_H)
                        current_y = MARGIN_TOP
                    current_page.insert_text(
                        (MARGIN_X, current_y),
                        " ".join(current_line),
                        fontsize=font_size,
                        fontname="helv"
                    )
                    current_y += line_height
                    current_line = [word]
                else:
                    current_line.append(word)

            if current_line:
                if current_y + line_height > (PAGE_H - MARGIN_BOTTOM):
                    current_page = pdf_doc.new_page(width=PAGE_W, height=PAGE_H)
                    current_y = MARGIN_TOP
                current_page.insert_text(
                    (MARGIN_X, current_y),
                    " ".join(current_line),
                    fontsize=font_size,
                    fontname="helv"
                )
                current_y += line_height + 4.0

        if len(pdf_doc) == 0:
            pdf_doc.new_page(width=PAGE_W, height=PAGE_H)

        pdf_doc.save(str(out_path), garbage=3, deflate=True)
        pdf_doc.close()

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "tool": "word-to-pdf"
        }

    @staticmethod
    def pdf_to_jpg(
        pdf_path: str,
        original_filename: str,
        dpi: int = 150
    ) -> Dict[str, Any]:
        """
        Renders PDF pages as high-quality JPG images.
        If single page: returns .jpg. If multi-page: packs into a .zip.
        """
        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        doc = fitz.open(pdf_path)
        page_count = len(doc)

        if page_count == 0:
            raise ValueError("The PDF document has no pages.")

        if page_count == 1:
            # Single page direct JPG
            out_filename = generate_unique_filename(f"{base_name}.jpg", prefix="pdf2jpg", new_ext=".jpg")
            out_path = PROCESSED_DIR / out_filename
            page = doc[0]
            pix = page.get_pixmap(dpi=dpi)
            pix.save(str(out_path))
            doc.close()
            out_size = os.path.getsize(out_path)
            return {
                "success": True,
                "filename": out_filename,
                "download_url": f"/api/files/download/{out_filename}",
                "original_size": orig_size,
                "original_size_formatted": format_bytes(orig_size),
                "processed_size": out_size,
                "processed_size_formatted": format_bytes(out_size),
                "pages_count": 1,
                "is_zip": False,
                "tool": "pdf-to-jpg"
            }
        else:
            # Multi-page ZIP archive
            zip_filename = generate_unique_filename(f"{base_name}_images.zip", prefix="pdf2jpg_pack", new_ext=".zip")
            zip_path = PROCESSED_DIR / zip_filename

            preview_filename = generate_unique_filename(f"{base_name}_p1.jpg", prefix="preview", new_ext=".jpg")
            preview_path = PROCESSED_DIR / preview_filename

            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for idx, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes(output="jpg")
                    zip_file.writestr(f"{base_name}_page_{idx+1:03d}.jpg", img_bytes)
                    if idx == 0:
                        with open(preview_path, "wb") as pf:
                            pf.write(img_bytes)

            doc.close()
            out_size = os.path.getsize(zip_path)

            return {
                "success": True,
                "filename": zip_filename,
                "download_url": f"/api/files/download/{zip_filename}",
                "preview_url": f"/api/files/download/{preview_filename}",
                "original_size": orig_size,
                "original_size_formatted": format_bytes(orig_size),
                "processed_size": out_size,
                "processed_size_formatted": format_bytes(out_size),
                "pages_count": page_count,
                "is_zip": True,
                "tool": "pdf-to-jpg"
            }

    @staticmethod
    def merge_pdfs(
        pdf_paths: List[str],
        original_filenames: List[str]
    ) -> Dict[str, Any]:
        """
        Combines multiple PDF files into a single consolidated PDF document.
        """
        if len(pdf_paths) < 2:
            raise ValueError("At least 2 PDF files are required for merging.")

        total_input_bytes = sum(os.path.getsize(p) for p in pdf_paths)
        first_stem = Path(original_filenames[0]).stem if original_filenames else "merged"
        out_filename = generate_unique_filename(f"{first_stem}_merged.pdf", prefix="merge_pdf", new_ext=".pdf")
        out_path = PROCESSED_DIR / out_filename

        merged_doc = fitz.open()
        total_pages = 0

        for p in pdf_paths:
            src = fitz.open(p)
            total_pages += len(src)
            merged_doc.insert_pdf(src)
            src.close()

        merged_doc.save(str(out_path), garbage=3, deflate=True)
        merged_doc.close()

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": total_input_bytes,
            "original_size_formatted": format_bytes(total_input_bytes),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "files_merged": len(pdf_paths),
            "total_pages": total_pages,
            "tool": "merge-pdf"
        }

    @staticmethod
    def split_pdf(
        pdf_path: str,
        original_filename: str,
        split_mode: str = "range", # "range" or "all_pages"
        page_range: Optional[str] = None # e.g. "1-3, 5, 8-10"
    ) -> Dict[str, Any]:
        """
        Splits a PDF either into individual pages (zipped) or extracts a custom page range.
        """
        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        doc = fitz.open(pdf_path)
        total_pages = len(doc)

        if total_pages == 0:
            raise ValueError("The PDF document contains no pages.")

        if split_mode == "all_pages":
            # Split all pages into separate PDFs in a zip
            zip_filename = generate_unique_filename(f"{base_name}_split.zip", prefix="split_all", new_ext=".zip")
            zip_path = PROCESSED_DIR / zip_filename

            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for idx in range(total_pages):
                    single_doc = fitz.open()
                    single_doc.insert_pdf(doc, from_page=idx, to_page=idx)
                    page_bytes = single_doc.tobytes(garbage=3, deflate=True)
                    single_doc.close()
                    zip_file.writestr(f"{base_name}_page_{idx+1:03d}.pdf", page_bytes)

            doc.close()
            out_size = os.path.getsize(zip_path)
            return {
                "success": True,
                "filename": zip_filename,
                "download_url": f"/api/files/download/{zip_filename}",
                "original_size": orig_size,
                "original_size_formatted": format_bytes(orig_size),
                "processed_size": out_size,
                "processed_size_formatted": format_bytes(out_size),
                "pages_count": total_pages,
                "is_zip": True,
                "tool": "split-pdf"
            }
        else:
            # Extract specified range (1-indexed from user)
            selected_pages = []
            if page_range:
                parts = [p.strip() for p in page_range.split(",") if p.strip()]
                for part in parts:
                    if "-" in part:
                        start_s, end_s = part.split("-", 1)
                        start = max(1, int(start_s.strip()))
                        end = min(total_pages, int(end_s.strip()))
                        selected_pages.extend(range(start - 1, end))
                    else:
                        p_num = int(part.strip())
                        if 1 <= p_num <= total_pages:
                            selected_pages.append(p_num - 1)
            else:
                # Default first page
                selected_pages = [0]

            # Remove duplicates preserving order
            seen = set()
            clean_pages = [x for x in selected_pages if not (x in seen or seen.add(x))]

            out_filename = generate_unique_filename(f"{base_name}_extracted.pdf", prefix="split_range", new_ext=".pdf")
            out_path = PROCESSED_DIR / out_filename

            extracted_doc = fitz.open()
            for p_idx in clean_pages:
                extracted_doc.insert_pdf(doc, from_page=p_idx, to_page=p_idx)

            extracted_doc.save(str(out_path), garbage=3, deflate=True)
            extracted_doc.close()
            doc.close()

            out_size = os.path.getsize(out_path)

            return {
                "success": True,
                "filename": out_filename,
                "download_url": f"/api/files/download/{out_filename}",
                "original_size": orig_size,
                "original_size_formatted": format_bytes(orig_size),
                "processed_size": out_size,
                "processed_size_formatted": format_bytes(out_size),
                "pages_count": len(clean_pages),
                "is_zip": False,
                "tool": "split-pdf"
            }

    @staticmethod
    def pdf_to_excel(
        pdf_path: str,
        original_filename: str
    ) -> Dict[str, Any]:
        """
        Extracts tabular data or structured text from PDF and builds a formatted Microsoft Excel (.xlsx) file.
        """
        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        out_filename = generate_unique_filename(f"{base_name}.xlsx", prefix="pdf2excel", new_ext=".xlsx")
        out_path = PROCESSED_DIR / out_filename

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Extracted PDF Data"

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
        cell_font = Font(name="Calibri", size=10)
        border_side = Side(border_style="thin", color="E2E8F0")
        thin_border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)

        doc = fitz.open(pdf_path)
        current_row = 1
        tables_found = 0

        for page_idx, page in enumerate(doc):
            # Attempt to find tables with PyMuPDF
            try:
                tables = page.find_tables()
                if tables and len(tables.tables) > 0:
                    for table in tables:
                        tables_found += 1
                        table_data = table.extract()
                        if not table_data:
                            continue

                        # Page banner
                        ws.cell(row=current_row, column=1, value=f"Page {page_idx + 1} — Table {tables_found}").font = Font(bold=True, color="1E3A8A")
                        current_row += 1

                        for r_idx, row_values in enumerate(table_data):
                            for c_idx, val in enumerate(row_values):
                                cell = ws.cell(row=current_row, column=c_idx + 1, value=str(val or "").strip())
                                cell.border = thin_border
                                if r_idx == 0:
                                    cell.font = header_font
                                    cell.fill = header_fill
                                else:
                                    cell.font = cell_font
                            current_row += 1
                        current_row += 1
                    continue
            except Exception:
                pass

            # Fallback to structured text extraction
            blocks = page.get_text("blocks")
            if blocks:
                ws.cell(row=current_row, column=1, value=f"Page {page_idx + 1} Content").font = Font(bold=True, color="1E3A8A")
                current_row += 1
                for b in blocks:
                    if b[6] == 0: # text block
                        lines = [ln.strip() for ln in b[4].split("\n") if ln.strip()]
                        for line in lines:
                            # If comma or tab separated, split into columns
                            if "\t" in line:
                                cols = line.split("\t")
                            elif "," in line and len(line.split(",")) > 2:
                                cols = line.split(",")
                            else:
                                cols = [line]

                            for c_idx, col_val in enumerate(cols):
                                cell = ws.cell(row=current_row, column=c_idx + 1, value=col_val.strip())
                                cell.font = cell_font
                            current_row += 1
                current_row += 1

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = 0
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            for cell in col:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
            ws.column_dimensions[col_letter].width = min(50, max(12, max_len + 3))

        doc.close()
        wb.save(str(out_path))

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "tables_extracted": tables_found,
            "tool": "pdf-to-excel"
        }

    @staticmethod
    def protect_pdf(
        pdf_path: str,
        original_filename: str,
        user_password: str
    ) -> Dict[str, Any]:
        """
        Encrypts PDF with AES-256 standard password protection.
        """
        if not user_password:
            raise ValueError("Password cannot be blank.")

        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        out_filename = generate_unique_filename(f"{base_name}_protected.pdf", prefix="protect", new_ext=".pdf")
        out_path = PROCESSED_DIR / out_filename

        doc = fitz.open(pdf_path)
        # Encrypt with AES-256
        doc.save(
            str(out_path),
            encryption=fitz.PDF_ENCRYPT_AES_256,
            user_pw=user_password,
            owner_pw=user_password,
            garbage=3,
            deflate=True
        )
        doc.close()

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "tool": "protect-pdf"
        }

    @staticmethod
    def rotate_pdf(
        pdf_path: str,
        original_filename: str,
        angle: int = 90
    ) -> Dict[str, Any]:
        """
        Rotates all pages of a PDF by 90, 180, or 270 degrees clockwise.
        """
        orig_size = os.path.getsize(pdf_path)
        base_name = Path(original_filename).stem
        out_filename = generate_unique_filename(f"{base_name}_rotated.pdf", prefix="rotate", new_ext=".pdf")
        out_path = PROCESSED_DIR / out_filename

        doc = fitz.open(pdf_path)
        for page in doc:
            page.set_rotation((page.rotation + angle) % 360)

        doc.save(str(out_path), garbage=3, deflate=True)
        doc.close()

        out_size = os.path.getsize(out_path)

        return {
            "success": True,
            "filename": out_filename,
            "download_url": f"/api/files/download/{out_filename}",
            "original_size": orig_size,
            "original_size_formatted": format_bytes(orig_size),
            "processed_size": out_size,
            "processed_size_formatted": format_bytes(out_size),
            "rotation_angle": angle,
            "tool": "rotate-pdf"
        }
