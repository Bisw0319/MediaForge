import os
import re
import uuid
import zipfile
from pathlib import Path
from typing import Optional, List, Tuple

import tempfile

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Ensure temporary working directory is safely writable in all cloud environments
try:
    TEMP_DIR = BASE_DIR / "temp"
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    test_probe = TEMP_DIR / ".write_probe"
    test_probe.touch()
    test_probe.unlink(missing_ok=True)
except Exception:
    TEMP_DIR = Path(tempfile.gettempdir()) / "mediaforge_temp"
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

UPLOADS_DIR = TEMP_DIR / "uploads"
PROCESSED_DIR = TEMP_DIR / "processed"
ARCHIVES_DIR = TEMP_DIR / "archives"

# Ensure all temporary subdirectories exist
for folder in [TEMP_DIR, UPLOADS_DIR, PROCESSED_DIR, ARCHIVES_DIR]:
    try:
        folder.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass


def sanitize_filename(filename: str) -> str:
    """Removes path traversal characters and normalizes file name"""
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', clean_name)
    return clean_name or "file"


def generate_unique_filename(original_filename: str, prefix: str = "", new_ext: Optional[str] = None) -> str:
    """Generates a secure unique filename preserving or updating the extension"""
    sanitized = sanitize_filename(original_filename)
    stem = Path(sanitized).stem
    ext = new_ext if new_ext else Path(sanitized).suffix
    if ext and not ext.startswith("."):
        ext = f".{ext}"
    
    unique_id = uuid.uuid4().hex[:10]
    p = f"{prefix}_" if prefix else ""
    return f"{p}{stem[:20]}_{unique_id}{ext}"


def format_bytes(bytes_num: int) -> str:
    """Formats bytes to readable human string like 25.4 MB"""
    if bytes_num < 0:
        return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_num < 1024.0:
            if unit == 'B':
                return f"{int(bytes_num)} {unit}"
            return f"{bytes_num:.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} PB"


def parse_target_size_to_bytes(target_size_str_or_num) -> int:
    """
    Parses flexible user inputs:
    e.g. 5, "5", "5MB", "500KB", "2.5 MB" -> integer bytes
    """
    if isinstance(target_size_str_or_num, (int, float)):
        # Default numeric is considered Megabytes if < 1000, else bytes
        if target_size_str_or_num < 2000:
            return int(target_size_str_or_num * 1024 * 1024)
        return int(target_size_str_or_num)
    
    s = str(target_size_str_or_num).strip().upper()
    match = re.match(r"^([\d\.]+)\s*([A-Z]*)$", s)
    if not match:
        raise ValueError(f"Invalid target size specification: {target_size_str_or_num}")
    
    val = float(match.group(1))
    unit = match.group(2)
    
    if unit in ["B", "BYTES", ""]:
        return int(val * 1024 * 1024) if val < 2000 else int(val)
    elif unit in ["K", "KB"]:
        return int(val * 1024)
    elif unit in ["M", "MB"]:
        return int(val * 1024 * 1024)
    elif unit in ["G", "GB"]:
        return int(val * 1024 * 1024 * 1024)
    else:
        return int(val * 1024 * 1024)


def create_zip_archive(files_list: List[Tuple[str, str]], zip_filename: str) -> str:
    """
    Creates a zip archive from a list of (actual_file_path, display_name_in_zip).
    Returns path to created zip archive.
    """
    zip_path = ARCHIVES_DIR / zip_filename
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for actual_path, display_name in files_list:
            if os.path.exists(actual_path):
                zf.write(actual_path, arcname=display_name)
    return str(zip_path)
