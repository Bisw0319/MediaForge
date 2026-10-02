"""
Automated diagnostic script to test all backend endpoints and features.
"""
import sys
import os
import requests
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api"
MEDIA_DIR = Path(__file__).resolve().parent / "tests_media"

jpg_file = MEDIA_DIR / "sample.jpg"
mp3_file = MEDIA_DIR / "sample.mp3"
mp4_file = MEDIA_DIR / "sample.mp4"
pdf_file = MEDIA_DIR / "sample.pdf"

results = []

def run_test(name, fn):
    try:
        status, detail = fn()
        if status:
            print(f" [PASS] {name}: {detail}")
            results.append((name, "PASS", detail))
        else:
            print(f" [FAIL] {name}: {detail}")
            results.append((name, "FAIL", detail))
    except Exception as e:
        print(f" [ERROR] {name}: {e}")
        results.append((name, "ERROR", str(e)))

# 1. Health
def test_health():
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    return r.status_code == 200, f"HTTP {r.status_code}"

# 2. Image Compress
def test_image_compress():
    with open(jpg_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/image/compress",
            files={"file": ("test.jpg", f, "image/jpeg")},
            data={"mode": "target_size", "target_size_mb": "0.05"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 3. Image Resize
def test_image_resize():
    with open(jpg_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/image/resize",
            files={"file": ("test.jpg", f, "image/jpeg")},
            data={"mode": "custom", "width": 400, "height": 300},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 4. Image Convert
def test_image_convert():
    with open(jpg_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/image/convert",
            files={"file": ("test.jpg", f, "image/jpeg")},
            data={"target_format": "webp"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 5. Video Compress
def test_video_compress():
    with open(mp4_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/video/compress",
            files={"file": ("test.mp4", f, "video/mp4")},
            data={"mode": "target_size", "target_size_mb": "0.1"},
            timeout=30
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 6. Video Convert
def test_video_convert():
    with open(mp4_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/video/convert",
            files={"file": ("test.mp4", f, "video/mp4")},
            data={"target_format": "webm"},
            timeout=30
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 7. Audio Compress
def test_audio_compress():
    with open(mp3_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/audio/compress",
            files={"file": ("test.mp3", f, "audio/mpeg")},
            data={"mode": "percentage", "percentage": 50},
            timeout=20
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 8. PDF Compress
def test_pdf_compress():
    with open(pdf_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf/compress",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"mode": "target_size", "target_size_mb": "0.5"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 9. PDF Advanced - Img to PDF
def test_pdf_img_to_pdf():
    with open(jpg_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf-tools/img-to-pdf",
            files=[("files", ("test.jpg", f, "image/jpeg"))],
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 10. PDF Advanced - PDF to Img
def test_pdf_to_img():
    with open(pdf_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf-tools/pdf-to-jpg",
            files={"file": ("test.pdf", f, "application/pdf")},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 11. PDF Advanced - Split
def test_pdf_split():
    with open(pdf_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf-tools/split",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"split_mode": "all_pages"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 12. PDF Advanced - Rotate
def test_pdf_rotate():
    with open(pdf_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf-tools/rotate",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"angle": 90},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 13. PDF Advanced - Protect
def test_pdf_protect():
    with open(pdf_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/pdf-tools/protect",
            files={"file": ("test.pdf", f, "application/pdf")},
            data={"password": "testpassword123"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 14. ZIP Creator
def test_zip_creator():
    with open(jpg_file, "rb") as f1, open(pdf_file, "rb") as f2:
        r = requests.post(
            f"{BASE_URL}/compression/create-zip",
            files=[
                ("files", ("test.jpg", f1, "image/jpeg")),
                ("files", ("test.pdf", f2, "application/pdf"))
            ],
            data={"archive_name": "test_archive"},
            timeout=15
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 15. Background Removal
def test_bg_removal():
    with open(jpg_file, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/background/remove",
            files={"file": ("test.jpg", f, "image/jpeg")},
            data={"bg_type": "transparent"},
            timeout=30
        )
    return r.status_code == 200, f"HTTP {r.status_code}"

# 16. Bug Report
def test_bug_report():
    r = requests.post(
        f"{BASE_URL}/bug-report",
        json={"category": "Test", "description": "Automated verification test"},
        timeout=10
    )
    return r.status_code == 200, f"HTTP {r.status_code}"

print("=" * 60)
print(" MediaForge All-Feature Diagnostics")
print("=" * 60)
run_test("Health API", test_health)
run_test("Image Compression", test_image_compress)
run_test("Image Resizing", test_image_resize)
run_test("Image Conversion", test_image_convert)
run_test("Video Compression", test_video_compress)
run_test("Video Conversion", test_video_convert)
run_test("Audio Compression", test_audio_compress)
run_test("PDF Compression", test_pdf_compress)
run_test("PDF: Image to PDF", test_pdf_img_to_pdf)
run_test("PDF: PDF to Image", test_pdf_to_img)
run_test("PDF: Split", test_pdf_split)
run_test("PDF: Rotate", test_pdf_rotate)
run_test("PDF: Protect", test_pdf_protect)
run_test("ZIP Creator", test_zip_creator)
run_test("Background Removal", test_bg_removal)
run_test("Bug Report Dispatch", test_bug_report)

print("=" * 60)
passed = sum(1 for _, s, _ in results if s == "PASS")
failed = sum(1 for _, s, _ in results if s != "PASS")
print(f" Summary: {passed} PASSED, {failed} FAILED out of {len(results)} features")
print("=" * 60)
