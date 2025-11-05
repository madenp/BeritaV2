#!/bin/bash

echo "========================================"
echo "Starting Local Web Server"
echo "========================================"
echo ""

# Cek apakah Python terinstall
if command -v python3 &> /dev/null; then
    echo "Python ditemukan! Menggunakan Python HTTP Server..."
    echo ""
    echo "Server akan berjalan di: http://localhost:8000"
    echo "Tekan Ctrl+C untuk menghentikan server"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# Cek apakah Python 2 terinstall
if command -v python &> /dev/null; then
    echo "Python ditemukan! Menggunakan Python HTTP Server..."
    echo ""
    echo "Server akan berjalan di: http://localhost:8000"
    echo "Tekan Ctrl+C untuk menghentikan server"
    echo ""
    python -m SimpleHTTPServer 8000
    exit 0
fi

# Cek apakah Node.js terinstall
if command -v node &> /dev/null; then
    echo "Node.js ditemukan! Menggunakan Node.js HTTP Server..."
    echo ""
    echo "Menginstall http-server (jika belum terinstall)..."
    npm install -g http-server 2>/dev/null
    echo ""
    echo "Server akan berjalan di: http://localhost:8000"
    echo "Tekan Ctrl+C untuk menghentikan server"
    echo ""
    http-server -p 8000
    exit 0
fi

# Cek apakah PHP terinstall
if command -v php &> /dev/null; then
    echo "PHP ditemukan! Menggunakan PHP Built-in Server..."
    echo ""
    echo "Server akan berjalan di: http://localhost:8000"
    echo "Tekan Ctrl+C untuk menghentikan server"
    echo ""
    php -S localhost:8000
    exit 0
fi

echo ""
echo "ERROR: Tidak ada web server yang ditemukan!"
echo ""
echo "Silakan install salah satu dari berikut:"
echo "1. Python: https://www.python.org/downloads/"
echo "2. Node.js: https://nodejs.org/"
echo "3. PHP: https://www.php.net/downloads.php"
echo ""
echo "Atau gunakan VS Code dengan extension Live Server"
echo ""

