@echo off
REM TaskBridge Day 1 Startup Script

echo.
echo ========================================
echo   TaskBridge - Day 1 Setup
echo ========================================
echo.

echo Starting Backend...
cd c:\Users\sif-\Downloads\taskbridge\taskbridge
start "Backend - TaskBridge" cmd /k "java -jar target/taskbridge-0.0.1-SNAPSHOT.jar"

timeout /t 5

echo Starting Frontend...
cd c:\Users\sif-\Desktop\taskbridge-ui\taskbridge-ui
start "Frontend - TaskBridge" cmd /k "npm run dev"

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser
echo.
pause
