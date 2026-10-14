@echo off
title FinTrack - AI Personal Finance System
cls

echo ==========================================================
echo           FinTrack: Multi-Device Finance System           
echo ==========================================================
echo.

:: Ensure Node is in PATH
where node >nul 2>nul
if %errorlevel% neq 0 (
    set "PATH=C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%"
)

:: Find Local Wi-Fi / LAN IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    goto :ip_found
)
:ip_found
set IP=%IP: =%

echo [Access Information]
echo - On THIS PC:              http://localhost:3000
echo - On OTHER Devices (Wi-Fi): http://%IP%:3000
echo - Full App (Single Port):  http://%IP%:5001
echo.
echo Launching your browser in 3 seconds...
start "" "http://localhost:3000"

echo.
echo Starting development servers...
npm run dev
pause
