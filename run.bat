@echo off
cd /d "%~dp0"
echo =========================================================
echo   Starting MediaForge Platform (Backend & Frontend)
echo =========================================================
echo.

:: Start FastAPI Backend
start "MediaForge Backend (:8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Start Vite Frontend
start "MediaForge Frontend (:5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Both servers launched in separate windows!
echo  - Frontend Web UI: http://localhost:5173
echo  - Backend API:     http://127.0.0.1:8000
echo.
echo Leave both terminal windows open while using MediaForge.
echo.
pause
