"""
MediaForge Security Utilities
Enforces comprehensive file validation:
1. Type & Magic Byte Content Validation (preventing MIME spoofing and disguised payloads)
2. Size validation during streaming (preventing DoS and disk exhaustion)
3. Isolated storage outside the web root (strictly inside temp/uploads)
4. Non-executable storage and safety guarantees (preventing remote code execution)
"""

import os
import re
import uuid
from pathlib import Path
from typing import Optional, Tuple, Set, Dict
from fastapi import UploadFile, HTTPException

from .file_utils import UPLOADS_DIR, sanitize_filename

# ------------------------------------------------------------------------------
# Maximum Allowed File Sizes (in Megabytes)
# ------------------------------------------------------------------------------
MAX_FILE_SIZES_MB: Dict[str, int] = {
    "image": 50,        # 50 MB for images
    "video": 500,       # 500 MB for video files
    "audio": 100,       # 100 MB for audio tracks
    "pdf": 100,         # 100 MB for PDF documents
    "document": 100,    # 100 MB for Word/Excel/PDF
    "archive": 300,     # 300 MB for ZIP archives
    "any": 500          # Fallback max ceiling
}

# ------------------------------------------------------------------------------
# Strictly Prohibited Extensions (Never allowed under any circumstances)
# ------------------------------------------------------------------------------
DANGEROUS_EXTENSIONS: Set[str] = {
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".zsh", ".php", ".phtml", ".php3",
    ".php4", ".php5", ".phps", ".py", ".pyw", ".pyc", ".js", ".mjs", ".cjs",
    ".vbs", ".vbe", ".ps1", ".psm1", ".psd1", ".scr", ".pif", ".dll", ".so",
    ".dylib", ".com", ".hta", ".jar", ".msi", ".msp", ".jsp", ".jspx", ".asp",
    ".aspx", ".cgi", ".pl", ".pm", ".reg", ".lnk", ".wsf", ".wsh", ".inf",
    ".cpl", ".sys", ".drv", ".app", ".action", ".workflow", ".bin", ".elf"
}

# ------------------------------------------------------------------------------
# Allowed Extensions by Category
# ------------------------------------------------------------------------------
ALLOWED_EXTENSIONS: Dict[str, Set[str]] = {
    "image": {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif", ".avif", ".ico"},
    "video": {".mp4", ".mkv", ".mov", ".webm", ".avi", ".flv", ".wmv", ".m4v", ".3gp", ".ts", ".mts", ".ogv"},
    "audio": {".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma", ".opus", ".aiff", ".m4r"},
    "pdf": {".pdf"},
    "document": {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".txt", ".rtf", ".csv"},
    "archive": {".zip"},
    "any_media": {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif", ".avif",
        ".mp4", ".mkv", ".mov", ".webm", ".avi", ".flv", ".wmv", ".m4v", ".3gp",
        ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a",
        ".pdf", ".docx", ".xlsx", ".zip"
    }
}

# Dangerous Content Signatures (Executables, Shell scripts, PHP, HTML)
PROHIBITED_MAGIC_SIGNATURES = [
    (b"MZ", "Windows Executable/DLL (PE)"),
    (b"\x7fELF", "Linux ELF Executable"),
    (b"\xfe\xed\xfa\xce", "Mach-O 32-bit Executable"),
    (b"\xfe\xed\xfa\xcf", "Mach-O 64-bit Executable"),
    (b"\xce\xfa\xed\xfe", "Mach-O Executable"),
    (b"\xcf\xfa\xed\xfe", "Mach-O Executable"),
    (b"\xca\xfe\xba\xbe", "Java Bytecode / Mach-O Fat Binary"),
    (b"<?php", "PHP Script"),
    (b"<script", "HTML/JavaScript Payload"),
    (b"#!/bin/", "Shell Script"),
    (b"#!/usr/bin/", "Shell Script")
]


def check_magic_bytes(header: bytes, expected_category: str) -> bool:
    """
    Validates that the file header matches known signatures for the given category
    and does NOT contain dangerous executable / script magic bytes.
    """
    # 1. Reject any dangerous executable or script signatures regardless of extension
    for sig, label in PROHIBITED_MAGIC_SIGNATURES:
        if header.startswith(sig) or (sig in header[:64] and sig in [b"<?php", b"<script", b"#!/bin/"]):
            raise HTTPException(
                status_code=400,
                detail=f"Security violation: File contains prohibited {label} signature and was rejected."
            )

    # 2. Category-specific content validation
    if expected_category == "image":
        is_jpeg = header.startswith(b"\xff\xd8\xff")
        is_png = header.startswith(b"\x89PNG\r\n\x1a\n")
        is_gif = header.startswith(b"GIF87a") or header.startswith(b"GIF89a")
        is_webp = header.startswith(b"RIFF") and b"WEBP" in header[8:16]
        is_bmp = header.startswith(b"BM")
        is_tiff = header.startswith(b"II*\x00") or header.startswith(b"MM\x00*")
        is_avif = b"ftypavif" in header[:32] or b"ftypavis" in header[:32]
        is_ico = header.startswith(b"\x00\x00\x01\x00")
        return is_jpeg or is_png or is_gif or is_webp or is_bmp or is_tiff or is_avif or is_ico

    elif expected_category == "video":
        is_mp4_mov = (
            (len(header) >= 8 and header[4:8] == b"ftyp") or
            b"moov" in header[:64] or
            b"mdat" in header[:64] or
            b"wide" in header[:64] or
            b"free" in header[:64]
        )
        is_mkv_webm = header.startswith(b"\x1a\x45\xdf\xa3")
        is_avi = header.startswith(b"RIFF") and b"AVI " in header[8:16]
        is_flv = header.startswith(b"FLV\x01")
        is_wmv = header.startswith(b"\x30\x26\xb2\x75\x8e\x66\xcf\x11")
        return is_mp4_mov or is_mkv_webm or is_avi or is_flv or is_wmv

    elif expected_category == "audio":
        is_mp3 = (
            header.startswith(b"ID3") or
            (len(header) >= 2 and header[0] == 0xff and (header[1] & 0xe0) == 0xe0)
        )
        is_wav = header.startswith(b"RIFF") and b"WAVE" in header[8:16]
        is_flac = header.startswith(b"fLaC")
        is_ogg = header.startswith(b"OggS")
        is_m4a = len(header) >= 8 and (b"ftypM4A" in header[:32] or b"ftypmp42" in header[:32] or b"ftyp" in header[:16])
        is_aac = len(header) >= 2 and header[0] == 0xff and (header[1] & 0xf6) == 0xf0
        return is_mp3 or is_wav or is_flac or is_ogg or is_m4a or is_aac

    elif expected_category == "pdf":
        return header.startswith(b"%PDF-")

    elif expected_category in ["document", "archive", "any_media"]:
        # Allow PDF, standard ZIP / Office OpenXML (PK\x03\x04), or known media signatures
        is_pdf = header.startswith(b"%PDF-")
        is_zip = header.startswith(b"PK\x03\x04") or header.startswith(b"PK\x05\x06")
        is_image = check_magic_bytes(header, "image")
        is_video = check_magic_bytes(header, "video")
        is_audio = check_magic_bytes(header, "audio")
        return is_pdf or is_zip or is_image or is_video or is_audio

    return True


async def validate_and_save_upload(
    upload_file: UploadFile,
    expected_category: str = "any_media",
    max_size_mb: Optional[int] = None,
    prefix: str = "upload"
) -> Tuple[Path, str]:
    """
    Strict security validation pipeline for file uploads:
    1. Null byte & Path traversal sanitization on filename.
    2. Blacklist check against executable/script extensions.
    3. Whitelist check against expected category extensions.
    4. Size enforcement during streaming (preventing memory or disk exhaustion).
    5. Magic byte content verification (preventing extension spoofing).
    6. Stored in isolated storage outside the web root (temp/uploads).
    7. Safe unique file naming without code execution potential.
    """
    raw_filename = upload_file.filename or "uploaded_file"
    # Prevent null-byte injection
    raw_filename = raw_filename.replace("\x00", "").strip()
    clean_name = sanitize_filename(raw_filename)
    ext = Path(clean_name).suffix.lower()

    # 1. Prohibited extension verification
    if not ext or ext in DANGEROUS_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Security violation: The file extension '{ext}' is prohibited and cannot be uploaded."
        )

    # 2. Allowed extension verification for the target feature category
    allowed = ALLOWED_EXTENSIONS.get(expected_category, ALLOWED_EXTENSIONS["any_media"])
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}' for {expected_category}. Expected one of: {', '.join(sorted(allowed))}"
        )

    # 3. Maximum size determination
    size_limit_mb = max_size_mb or MAX_FILE_SIZES_MB.get(expected_category, MAX_FILE_SIZES_MB["any"])
    max_bytes = size_limit_mb * 1024 * 1024

    # 4. Generate unique random filename in isolated UPLOADS_DIR
    unique_id = uuid.uuid4().hex[:12]
    safe_stored_name = f"{prefix}_{unique_id}{ext}"
    destination_path = (UPLOADS_DIR / safe_stored_name).resolve()

    # 5. Confirm destination path stays strictly isolated inside UPLOADS_DIR
    if not destination_path.is_relative_to(UPLOADS_DIR.resolve()):
        raise HTTPException(status_code=400, detail="Security violation: Path traversal detected.")

    # 6. Stream file to disk in safe chunks, validate magic bytes, and track size
    total_bytes = 0
    chunk_size = 64 * 1024  # 64 KB chunks
    first_chunk = True

    try:
        with open(destination_path, "wb") as buffer:
            while True:
                chunk = await upload_file.read(chunk_size)
                if not chunk:
                    break

                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size limit of {size_limit_mb} MB."
                    )

                if first_chunk:
                    # Validate magic bytes on initial buffer (header)
                    if not check_magic_bytes(chunk, expected_category):
                        raise HTTPException(
                            status_code=400,
                            detail=f"Content validation failed: The file content does not match the expected {expected_category} format."
                        )
                    first_chunk = False

                buffer.write(chunk)

        if total_bytes == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    except HTTPException:
        # Clean up partial upload immediately on rejection
        if destination_path.exists():
            try:
                destination_path.unlink(missing_ok=True)
            except Exception:
                pass
        raise
    except Exception as e:
        if destination_path.exists():
            try:
                destination_path.unlink(missing_ok=True)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to securely save upload: {str(e)}")

    # 7. Secure file permissions (Read/Write only, non-executable)
    try:
        os.chmod(destination_path, 0o600)
    except Exception:
        pass

    return destination_path, clean_name
