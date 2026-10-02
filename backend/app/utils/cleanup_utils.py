import os
import time
import logging
from pathlib import Path
from .file_utils import UPLOADS_DIR, PROCESSED_DIR, ARCHIVES_DIR

logger = logging.getLogger("mediaforge.cleanup")

def cleanup_old_files(max_age_seconds: int = 1800) -> int:
    """
    Deletes files older than max_age_seconds (default 30 mins)
    Returns number of deleted files.
    """
    now = time.time()
    deleted_count = 0

    for directory in [UPLOADS_DIR, PROCESSED_DIR, ARCHIVES_DIR]:
        if not directory.exists():
            continue
        for file_path in directory.iterdir():
            if file_path.is_file():
                try:
                    stat = file_path.stat()
                    if now - stat.st_mtime > max_age_seconds:
                        file_path.unlink(missing_ok=True)
                        deleted_count += 1
                except Exception as e:
                    logger.warning(f"Failed to delete {file_path}: {e}")

    if deleted_count > 0:
        logger.info(f"Cleaned up {deleted_count} temporary files.")
    return deleted_count


def delete_specific_file(file_path_str: str) -> bool:
    """Safely deletes a specific file inside temp directory"""
    try:
        p = Path(file_path_str).resolve()
        # Verify it is inside temp directory to prevent arbitrary file deletion
        base_temp = UPLOADS_DIR.parent.resolve()
        if base_temp in p.parents and p.is_file():
            p.unlink(missing_ok=True)
            return True
    except Exception as e:
        logger.warning(f"Failed to delete {file_path_str}: {e}")
    return False
