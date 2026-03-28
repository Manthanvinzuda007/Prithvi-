@echo off
echo =====================================
echo   PRITHVI v3.0 STARTING...
echo =====================================

:: Start Backend in new window
echo Starting Backend...
start cmd /k "cd prithvi-backend && npm install && node server.js"

:: Small delay (optional but safe)
timeout /t 3 > nul

:: Start Frontend in new window
echo Starting Frontend...
start cmd /k "cd prithvi-frontend && npm install && npm run dev"

echo =====================================
echo   BOTH SERVERS STARTED 🚀
echo =====================================
pause
