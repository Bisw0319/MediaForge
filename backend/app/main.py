import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from backend directory
backend_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=backend_env_path)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import (
    compression,
    image,
    video,
    pdf,
    audio,
    background,
    pdf_advanced
)
from .utils.cleanup_utils import cleanup_old_files
from .services.firebase_service import FirebaseService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("mediaforge.main")


async def periodic_cleanup_task():
    """Runs periodically in background to purge temporary files older than 30 mins"""
    while True:
        try:
            await asyncio.sleep(600)  # every 10 minutes
            cleanup_old_files(max_age_seconds=1800)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Error during periodic cleanup: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Non-blocking startup to ensure immediate port binding and instant readiness
    logger.info("MediaForge backend starting up...")

    async def async_startup_cleanup():
        try:
            cleanup_old_files(max_age_seconds=1800)
        except Exception as e:
            logger.warning(f"Initial cleanup notice: {e}")

    # Launch background cleanup tasks without blocking the ASGI lifespan yield
    asyncio.create_task(async_startup_cleanup())
    cleanup_task = asyncio.create_task(periodic_cleanup_task())

    logger.info("MediaForge startup complete. Ready to accept connections.")
    yield
    # Shutdown: Cancel cleanup worker
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    logger.info("MediaForge backend shut down cleanly.")


app = FastAPI(
    title="MediaForge API",
    description="All-in-one file compression and media optimization platform REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTPS Enforcement & Security Headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Global friendly error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "We couldn't process this file. Please try another file or a smaller size.",
            "detail": str(exc)
        }
    )

# Include routers
app.include_router(compression.router)
app.include_router(image.router)
app.include_router(video.router)
app.include_router(pdf.router)
app.include_router(audio.router)
app.include_router(background.router)
app.include_router(pdf_advanced.router)


from fastapi.responses import HTMLResponse, Response

@app.get("/", response_class=HTMLResponse)
async def root():
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MediaForge API — System Active</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #131b2e; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #1e293b; text-align: center; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { margin-top: 0; color: #38bdf8; font-size: 1.8rem; letter-spacing: -0.025em; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
        .badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.85rem; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1.25rem; }
        .links { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.75rem; }
        a { text-decoration: none; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.85rem; transition: all 0.2s; }
        .btn-primary { background: #0284c7; color: white; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); }
        .btn-primary:hover { background: #0369a1; transform: translateY(-1px); }
        .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
        .btn-secondary:hover { background: #334155; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">● Server Active & Healthy</span>
        <h1>MediaForge Backend</h1>
        <p>The high-performance media compression, transcoding, and background removal engine is running smoothly.</p>
        <div class="links">
            <a href="/" class="btn-primary">Launch Frontend App</a>
            <a href="/docs" class="btn-secondary">Interactive Swagger Docs</a>
        </div>
    </div>
</body>
</html>"""


@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)


@app.get("/health")
@app.get("/healthz")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MediaForge API",
        "version": "1.0.0",
        "features": {
            "image_compression": True,
            "video_compression": True,
            "pdf_compression": True,
            "audio_compression": True,
            "background_removal": True,
            "image_resizing": True,
            "image_conversion": True,
            "video_conversion": True,
            "zip_creation": True
        }
    }


from pydantic import BaseModel
import time
from typing import Optional
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .utils.file_utils import TEMP_DIR

import html
from email.utils import formatdate, make_msgid

TARGET_ADMIN_EMAIL = os.environ.get("TARGET_ADMIN_EMAIL", "freelixir.b@gmail.com").strip()

class BugReportPayload(BaseModel):
    category: str
    description: str
    user_agent: Optional[str] = None
    email_to: Optional[str] = None

def dispatch_bug_email(category: str, description: str, user_agent: Optional[str] = None):
    """
    Automatically dispatches the bug report to TARGET_ADMIN_EMAIL (freelixir.b@gmail.com).
    Logs to persistent disk queue and dispatches via SMTP if configured in environment.
    """
    target_email = os.environ.get("TARGET_ADMIN_EMAIL", "freelixir.b@gmail.com").strip()
    timestamp_str = time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())
    subject = f"[MediaForge Bug Report] {category}"

    # 1. Plain text version
    plain_content = (
        f"MediaForge Bug Report\n"
        f"============================================================\n"
        f"Category:    {category}\n"
        f"Timestamp:   {timestamp_str}\n"
        f"User Agent:  {user_agent or 'Unknown'}\n\n"
        f"Issue Description:\n"
        f"{description}\n"
        f"============================================================\n"
        f"Delivered to: {target_email}\n"
    )

    # 2. Rich HTML version for modern email clients (Gmail, Outlook, iOS)
    safe_category = html.escape(category)
    safe_description = html.escape(description).replace("\n", "<br/>")
    safe_ua = html.escape(user_agent or "Unknown")

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
  .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
  .header {{ background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); padding: 24px 28px; color: #ffffff; }}
  .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }}
  .header p {{ margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }}
  .body {{ padding: 28px; }}
  .badge {{ display: inline-block; padding: 4px 12px; background: #fef3c7; color: #b45309; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }}
  .meta {{ margin-top: 16px; font-size: 12px; color: #64748b; line-height: 1.6; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; }}
  .desc-box {{ margin-top: 20px; padding: 16px 20px; background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #0f172a; white-space: pre-wrap; }}
  .footer {{ padding: 16px 28px; background: #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; }}
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>MediaForge Bug Report</h1>
      <p>Automated submission from user feedback interface</p>
    </div>
    <div class="body">
      <div><span class="badge">{safe_category}</span></div>
      <div class="meta">
        <strong>Reported:</strong> {timestamp_str}<br/>
        <strong>Recipient:</strong> {target_email}<br/>
        <strong>Browser UA:</strong> {safe_ua}
      </div>
      <div style="margin-top: 18px; font-size: 13px; font-weight: 600; color: #475569;">Description:</div>
      <div class="desc-box">{safe_description}</div>
    </div>
    <div class="footer">
      MediaForge High-Performance Media Suite &bull; Confidential Developer Alert
    </div>
  </div>
</body>
</html>"""

    # 3. Always log to local disk queue
    report_file = TEMP_DIR / "bug_reports.log"
    try:
        with open(report_file, "a", encoding="utf-8") as f:
            f.write(
                f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] RECIPIENT: {target_email} | CATEGORY: {category}\n"
                f"UA: {user_agent}\n"
                f"{description}\n"
                f"{'-'*60}\n"
            )
    except Exception as e:
        logger.warning(f"Could not write to bug_reports.log: {e}")

    # 4. Outbound Web Mail Dispatcher (Direct delivery to inbox without requiring SMTP passwords)
    email_delivered = False
    try:
        import requests
        form_payload = {
            "_subject": f"[MediaForge Bug Report] {category}",
            "_captcha": "false",
            "_template": "table",
            "Category": category,
            "Reported At": timestamp_str,
            "Browser Device": user_agent or "Unknown",
            "Description": description,
            "_replyto": "noreply@mediaforge.app"
        }
        form_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://mediaforge.app/",
            "Origin": "https://mediaforge.app",
            "User-Agent": "MediaForge-Backend/1.0"
        }
        resp = requests.post(
            f"https://formsubmit.co/ajax/{target_email}",
            json=form_payload,
            headers=form_headers,
            timeout=12
        )
        if resp.status_code == 200 and resp.json().get("success") in [True, "true"]:
            logger.info(f"[EMAIL DISPATCH] Successfully forwarded bug report to {target_email} via Web Mail Dispatcher")
            email_delivered = True
        else:
            logger.warning(f"[EMAIL DISPATCH] Web Mail Dispatcher response: {resp.text}")
    except Exception as e:
        logger.warning(f"[EMAIL DISPATCH] Web Mail Dispatcher request failed: {e}")

    # 5. Outbound SMTP Dispatcher (if configured in backend/.env)
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com").strip()
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"MediaForge System <{smtp_user}>"
            msg["To"] = target_email
            msg["Subject"] = subject
            msg["Date"] = formatdate(localtime=True)
            msg["Message-ID"] = make_msgid(domain="mediaforge.local")

            msg.attach(MIMEText(plain_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)

            logger.info(f"[EMAIL DISPATCH] Successfully delivered bug report via SMTP to {target_email}")
            email_delivered = True
        except Exception as e:
            logger.error(f"[EMAIL DISPATCH ERROR] Failed to send email via SMTP to {target_email}: {e}")

    if not email_delivered:
        logger.warning(
            f"[EMAIL NOTICE] Bug report saved to temp/bug_reports.log and Firebase Firestore. "
            f"For direct SMTP delivery to {target_email}, add SMTP_PASSWORD in backend/.env. "
            f"Generate a Google App Password at https://myaccount.google.com/apppasswords"
        )

    return email_delivered

@app.post("/api/bug-report")
async def report_bug(report: BugReportPayload):
    logger.info(f"BUG REPORT received: [{report.category}] {report.description[:100]}...")
    
    # 1. Save to Firebase Firestore if connected
    firestore_doc_id = None
    try:
        firestore_doc_id = FirebaseService.save_bug_report(
            category=report.category,
            description=report.description,
            user_agent=report.user_agent
        )
    except Exception as e:
        logger.warning(f"Could not save to Firestore: {e}")

    # 2. Dispatch via SMTP and log to disk queue
    try:
        dispatch_bug_email(
            category=report.category,
            description=report.description,
            user_agent=report.user_agent
        )
    except Exception as e:
        logger.warning(f"Could not dispatch bug report: {e}")

    return {
        "success": True,
        "message": "Report submitted successfully.",
        "firestore_id": firestore_doc_id
    }


@app.get("/api/firebase/status")
async def firebase_status():
    """Returns the current connection status of Firebase"""
    return FirebaseService.get_status()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
