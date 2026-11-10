@echo off
chcp 65001 >nul
title Life and Study Dashboard

echo ====================================================
echo          LIFE and STUDY DASHBOARD - LAUNCHER
echo ====================================================
echo.

:: 1. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Chua cai dat Node.js tren may tinh!
    echo Vui long tai va cai dat Node.js ban 18 tro len tai: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Kiem tra file .env
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [THONG BAO] Da tu dong tao file .env tu .env.example.
    ) else (
        echo # LIFE and STUDY DASHBOARD > .env
        echo GEMINI_API_KEY= >> .env
        echo PORT=8787 >> .env
        echo HOST=127.0.0.1 >> .env
    )
    echo [LUU Y] Hay mo file .env dien GEMINI_API_KEY neu muon dung Tro ly AI.
    echo.
)

:: 3. Kiem tra va cai dat dependencies neu chua co
if not exist node_modules (
    echo [THONG BAO] Chua co node_modules. Dang tien hanh npm install...
    echo Qua trinh nay co the mat vai phut tuy toc do mang...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [LOI] Cai dat dependencies that bai. Vui long kiem tra lai ket noi mang!
        pause
        exit /b 1
    )
    echo [OK] Da cai dat xong dependencies!
    echo.
)

:: 4. Giai phong cong 8787 neu bi chiem boi phien chay cu
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8787" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%p >nul 2>nul
)

:: 5. Khoi chay ung dung
echo ====================================================
echo   DANG KHOI CHAY HE THONG...
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://127.0.0.1:8787
echo   Nhan Ctrl + C de tat ung dung.
echo ====================================================
echo.

call npm run dev:all

if errorlevel 1 (
    echo.
    echo [THONG BAO] Ung dung da dung lai.
    pause
)
