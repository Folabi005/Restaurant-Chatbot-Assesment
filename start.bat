@echo off
REM Quick Start Script for Restaurant ChatBot (Windows)

echo.
echo ============================================
echo   Restaurant ChatBot - Quick Start
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js is not installed.
    echo     Please install it from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo [OK] npm version:
npm --version
echo.

REM Check if .env exists
if not exist .env (
    echo [!] .env file not found. Copying from .env.example...
    copy .env.example .env
    echo [OK] .env file created
    echo.
    echo [INFO] Please edit .env with your Paystack credentials
    echo        Get them from: https://dashboard.paystack.com/settings/developers
    echo.
)

REM Install dependencies
echo [*] Installing dependencies...
call npm install

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo To start development:
echo.
echo   Command Prompt 1 (Frontend):
echo   C:\...^> npm run dev
echo.
echo   Command Prompt 2 (Backend):
echo   C:\...^> npm run dev:server
echo.
echo   Then open: http://localhost:5173
echo.
pause
