@echo off
echo ===================================================
echo   Starting CareerCraft AI Resume Analyzer
echo ===================================================
echo.

REM Update path to include portable node if installed in AppData
set "PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SystemRoot%\System32\WindowsPowerShell\v1.0\;%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"

echo 1. Starting FastAPI Python Backend on http://127.0.0.1:8000 ...
start "CareerCraft Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo 2. Starting Next.js Frontend on http://localhost:3000 ...
start "CareerCraft Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Services are booting up!
echo   Frontend: http://localhost:3000
echo   Backend Docs: http://127.0.0.1:8000/docs
echo ===================================================
timeout /t 5
