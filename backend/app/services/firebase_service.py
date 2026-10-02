import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta

logger = logging.getLogger("mediaforge.firebase")

_FIREBASE_APP = None
_FIRESTORE_CLIENT = None
_STORAGE_BUCKET = None

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Standard locations to look for Firebase Service Account Key
DEFAULT_KEY_LOCATIONS = [
    BASE_DIR / "firebase_service_account.json",
    BASE_DIR / "serviceAccountKey.json",
    BASE_DIR / "firebase-credentials.json",
]


def initialize_firebase() -> bool:
    """
    Initializes the Firebase Admin SDK if service account credentials exist.
    Supports either:
    1. A service account JSON file placed in backend/ directory
    2. An environment variable FIREBASE_CREDENTIALS_PATH
    3. An environment variable FIREBASE_CONFIG_JSON (raw JSON string)
    """
    global _FIREBASE_APP, _FIRESTORE_CLIENT, _STORAGE_BUCKET

    if _FIREBASE_APP is not None:
        return True

    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=BASE_DIR / ".env")
        import firebase_admin
        from firebase_admin import credentials, firestore, storage
    except ImportError:
        logger.warning("[FIREBASE] firebase-admin package is not installed.")
        return False

    cred = None
    cred_source = None

    # Option A: Path specified in environment
    env_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
    if env_path and os.path.exists(env_path):
        cred = credentials.Certificate(env_path)
        cred_source = env_path

    # Option B: Raw JSON in environment
    raw_json = os.environ.get("FIREBASE_CONFIG_JSON")
    if not cred and raw_json:
        try:
            parsed = json.loads(raw_json)
            cred = credentials.Certificate(parsed)
            cred_source = "FIREBASE_CONFIG_JSON (env)"
        except Exception as e:
            logger.warning(f"[FIREBASE] Failed to parse FIREBASE_CONFIG_JSON: {e}")

    # Option C: Known local file locations
    if not cred:
        for loc in DEFAULT_KEY_LOCATIONS:
            if loc.exists() and loc.is_file():
                cred = credentials.Certificate(str(loc))
                cred_source = str(loc)
                break

    if not cred:
        logger.info(
            "[FIREBASE] Service account key not detected yet. "
            "Local queue is active. To enable Firebase, place 'firebase_service_account.json' into backend/"
        )
        return False

    try:
        bucket_name = os.environ.get("FIREBASE_STORAGE_BUCKET", "").strip()
        options = {}
        if bucket_name:
            options["storageBucket"] = bucket_name

        _FIREBASE_APP = firebase_admin.initialize_app(cred, options)
        _FIRESTORE_CLIENT = firestore.client()

        if bucket_name:
            try:
                _STORAGE_BUCKET = storage.bucket(bucket_name)
            except Exception as e:
                logger.warning(f"[FIREBASE] Could not initialize storage bucket '{bucket_name}': {e}")
        else:
            try:
                _STORAGE_BUCKET = storage.bucket()
            except Exception:
                _STORAGE_BUCKET = None

        logger.info(f"[FIREBASE] Successfully connected via {cred_source}")
        return True
    except Exception as e:
        logger.error(f"[FIREBASE] Failed to initialize Firebase: {e}")
        _FIREBASE_APP = None
        _FIRESTORE_CLIENT = None
        _STORAGE_BUCKET = None
        return False


class FirebaseService:

    @staticmethod
    def is_active() -> bool:
        """Checks if Firebase Admin is connected and initialized"""
        global _FIREBASE_APP
        if _FIREBASE_APP is None:
            return initialize_firebase()
        return True

    @staticmethod
    def get_status() -> Dict[str, Any]:
        """Returns the current status of Firebase services"""
        active = FirebaseService.is_active()
        bucket_name = os.environ.get("FIREBASE_STORAGE_BUCKET")
        return {
            "initialized": active,
            "firestore_enabled": _FIRESTORE_CLIENT is not None,
            "storage_enabled": _STORAGE_BUCKET is not None,
            "bucket_name": bucket_name if bucket_name else "Not configured",
            "instructions": (
                "Place 'firebase_service_account.json' in backend/ and set FIREBASE_STORAGE_BUCKET in .env"
                if not active else "Firebase is active and connected!"
            )
        }

    @staticmethod
    def save_bug_report(
        category: str,
        description: str,
        user_agent: Optional[str] = None,
        recipient: Optional[str] = None
    ) -> Optional[str]:
        """
        Saves a user bug report into Firestore collection 'bug_reports'.
        Returns document ID if successful, None otherwise.
        """
        if not FirebaseService.is_active() or _FIRESTORE_CLIENT is None:
            return None

        try:
            now = datetime.now(timezone.utc)
            doc_data = {
                "category": category,
                "description": description,
                "user_agent": user_agent or "Unknown",
                "recipient": recipient or os.environ.get("TARGET_ADMIN_EMAIL", "freelixir.b@gmail.com"),
                "status": "new",
                "created_at": now.isoformat(),
                "created_timestamp": now.timestamp(),
            }
            _, doc_ref = _FIRESTORE_CLIENT.collection("bug_reports").add(doc_data)
            logger.info(f"[FIREBASE FIRESTORE] Bug report stored with Document ID: {doc_ref.id}")
            return doc_ref.id
        except Exception as e:
            logger.error(f"[FIREBASE FIRESTORE] Failed to write bug report: {e}")
            return None

    @staticmethod
    def upload_file(
        local_file_path: str,
        destination_blob_name: str,
        content_type: Optional[str] = None,
        expiration_minutes: int = 60
    ) -> Optional[str]:
        """
        Uploads a local file to Firebase Storage.
        Returns a secure signed download URL valid for `expiration_minutes`.
        """
        if not FirebaseService.is_active() or _STORAGE_BUCKET is None:
            return None

        if not os.path.exists(local_file_path):
            logger.warning(f"[FIREBASE STORAGE] Local file {local_file_path} not found.")
            return None

        try:
            blob = _STORAGE_BUCKET.blob(destination_blob_name)
            if content_type:
                blob.content_type = content_type

            blob.upload_from_filename(local_file_path)
            logger.info(f"[FIREBASE STORAGE] Uploaded {local_file_path} to blob {destination_blob_name}")

            # Generate a secure signed URL valid for expiration_minutes
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(minutes=expiration_minutes),
                method="GET"
            )
            return signed_url
        except Exception as e:
            logger.error(f"[FIREBASE STORAGE] Failed to upload file: {e}")
            return None
