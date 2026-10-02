@echo off
cd /d "%~dp0"
echo =========================================================
echo   Starting MediaForge Backend + Cloudflare Live Tunnel
echo =========================================================
echo.

:: Start FastAPI Backend
start "MediaForge Backend (:8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: Start Cloudflare HTTP/2 Tunnel
echo Starting Cloudflare Tunnel for Netlify connection...
start "MediaForge Live Tunnel" cmd /k "npx -y cloudflared tunnel --protocol http2 --url http://127.0.0.1:8000"

echo.
echo MediaForge Backend and Cloudflare Tunnel are now running!
echo Your Netlify website at https://mediaforgeee.netlify.app is live and ready.
echo Keep these terminal windows open while you want the site active.
echo.
pause
