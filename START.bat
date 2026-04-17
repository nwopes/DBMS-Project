@echo off
echo ========================================
echo   Crime Management System - Startup
echo ========================================
echo.

echo Starting Backend Server...
start "CMS Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Dev Server...
start "CMS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   App running at: http://localhost:3000
echo   API running at: http://localhost:5000
echo ========================================
echo.
pause
