"""
MediaForge - Email Delivery Verification Tool
Run this script to verify that bug reports will reach your Gmail inbox (freelixir.b@gmail.com).

Usage:
    cd backend
    venv\\Scripts\\python test_email.py
"""

import os
import sys
import smtplib
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, make_msgid
from dotenv import load_dotenv

# Load backend .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com").strip()
smtp_port = int(os.environ.get("SMTP_PORT", 587))
smtp_user = os.environ.get("SMTP_USER", "freelixir.b@gmail.com").strip()
smtp_password = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")
target_email = os.environ.get("TARGET_ADMIN_EMAIL", "freelixir.b@gmail.com").strip()

print("=" * 65)
print(" MediaForge - Email Dispatch Diagnostics")
print("=" * 65)
print(f"SMTP Host:       {smtp_host}:{smtp_port}")
print(f"Sender (From):   {smtp_user}")
print(f"Recipient (To):  {target_email}")
if smtp_password:
    masked = smtp_password[:3] + "..." + smtp_password[-3:] if len(smtp_password) > 6 else "***"
    print(f"SMTP Password:   CONFIGURED ({len(smtp_password)} chars: {masked})")
else:
    print("SMTP Password:   [EMPTY] - Not set yet in backend/.env")
print("-" * 65)

if not smtp_password:
    print("\n[!] WHY YOU ARE NOT RECEIVING EMAILS:")
    print("    Google's mail servers require authentication to prevent spam.")
    print("    Because SMTP_PASSWORD is blank in backend/.env, the backend")
    print("    saves bug reports locally (temp/bug_reports.log) instead of")
    print("    dispatching to your Gmail inbox.\n")
    print("HOW TO FIX IN 60 SECONDS:")
    print(" 1. Open: https://myaccount.google.com/apppasswords")
    print("    (Make sure 2-Step Verification is turned ON on your Google account)")
    print(" 2. Enter app name: 'MediaForge', then click 'Create'.")
    print(" 3. Google displays a 16-character code (e.g. 'abcd efgh ijkl mnop').")
    print(f" 4. Open: {env_path}")
    print("    Set:  SMTP_PASSWORD=your_16_character_code")
    print(" 5. Save the file and run this script again:\n")
    print("    python test_email.py\n")
    print("=" * 65)
    sys.exit(0)

print("\n[*] Connecting to Google SMTP server (smtp.gmail.com:587)...")
try:
    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
        server.ehlo()
        print("[+] Connected. Starting TLS encryption...")
        server.starttls()
        server.ehlo()
        print(f"[*] Authenticating as {smtp_user}...")
        server.login(smtp_user, smtp_password)
        print("[+] Authentication SUCCESSFUL!")

        print(f"[*] Dispatching test bug report email to {target_email}...")
        msg = MIMEMultipart("alternative")
        msg["From"] = f"MediaForge System <{smtp_user}>"
        msg["To"] = target_email
        msg["Subject"] = "[MediaForge] Test Bug Report Delivery"
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="mediaforge.local")

        plain_text = (
            "Congratulations!\n\n"
            "Your MediaForge bug reporting system is now fully connected to your Gmail account.\n"
            "Any bug reports submitted on the MediaForge website will now land directly in this inbox.\n"
        )
        html_text = f"""
        <div style="font-family:sans-serif;max-width:560px;margin:20px auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
            <h2 style="color:#0284c7;margin-top:0;">MediaForge Email Verified!</h2>
            <p style="color:#334155;font-size:14px;line-height:1.6;">
                Congratulations! Your MediaForge automated bug reporting system is connected.
            </p>
            <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:6px;font-size:13px;color:#15803d;margin:16px 0;">
                Bug reports submitted by users on your website will now be delivered directly to <strong>{target_email}</strong>.
            </div>
            <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">MediaForge Automated Diagnostics</p>
        </div>
        """
        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_text, "html"))

        server.send_message(msg)
        print(f"\n[+] SUCCESS! Test email has been delivered to {target_email}!")
        print("    Please check your Gmail inbox (and Spam/Promotions folder just in case).")
        print("=" * 65)

except smtplib.SMTPAuthenticationError as e:
    print(f"\n[-] Authentication FAILED: {e}")
    print("\n    Note: You MUST use a 16-character Google 'App Password',")
    print("    NOT your personal Google account password.")
    print("    Create one at: https://myaccount.google.com/apppasswords")
    print("=" * 65)
except Exception as e:
    print(f"\n[-] Error connecting or sending: {e}")
    print("=" * 65)
