@echo off
echo ========================================
echo   Crime Management System - Setup
echo ========================================
echo.
cd /d %~dp0
node setup-db.js
pause
