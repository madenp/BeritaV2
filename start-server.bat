@echo off
echo ========================================
echo Starting Local Web Server
echo ========================================
echo.

REM Cek apakah Python terinstall
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python ditemukan! Menggunakan Python HTTP Server...
    echo.
    echo Server akan berjalan di: http://localhost:8000
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    python -m http.server 8000
    goto :end
)

REM Cek apakah Node.js terinstall
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js ditemukan! Menggunakan Node.js HTTP Server...
    echo.
    echo Menginstall http-server (jika belum terinstall)...
    npm install -g http-server 2>nul
    echo.
    echo Server akan berjalan di: http://localhost:8000
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    http-server -p 8000
    goto :end
)

REM Cek apakah PHP terinstall
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo PHP ditemukan! Menggunakan PHP Built-in Server...
    echo.
    echo Server akan berjalan di: http://localhost:8000
    echo Tekan Ctrl+C untuk menghentikan server
    echo.
    php -S localhost:8000
    goto :end
)

echo.
echo ERROR: Tidak ada web server yang ditemukan!
echo.
echo Silakan install salah satu dari berikut:
echo 1. Python: https://www.python.org/downloads/
echo 2. Node.js: https://nodejs.org/
echo 3. PHP: https://www.php.net/downloads.php
echo.
echo Atau gunakan VS Code dengan extension Live Server
echo.
pause

:end

