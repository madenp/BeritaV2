# Cara Menjalankan Dashboard di Localhost

## 🚀 Cara Cepat (Windows)

1. **Double-click** file `start-server.bat`
2. Server akan otomatis berjalan
3. Buka browser dan akses: `http://localhost:8000`

## 🚀 Cara Cepat (Linux/Mac)

1. Buka terminal di folder proyek
2. Berikan permission execute:
   ```bash
   chmod +x start-server.sh
   ```
3. Jalankan script:
   ```bash
   ./start-server.sh
   ```
4. Buka browser dan akses: `http://localhost:8000`

---

## 📝 Cara Manual

### Opsi 1: Menggunakan Python (Recommended)

**Windows:**
```bash
python -m http.server 8000
```

**Linux/Mac:**
```bash
python3 -m http.server 8000
```

**Kemudian buka browser:**
```
http://localhost:8000
```

### Opsi 2: Menggunakan Node.js

**Install http-server (sekali saja):**
```bash
npm install -g http-server
```

**Jalankan server:**
```bash
http-server -p 8000
```

**Kemudian buka browser:**
```
http://localhost:8000
```

### Opsi 3: Menggunakan PHP

```bash
php -S localhost:8000
```

**Kemudian buka browser:**
```
http://localhost:8000
```

### Opsi 4: Menggunakan VS Code Live Server

1. Install extension **"Live Server"** di VS Code
2. Klik kanan pada file `index.html`
3. Pilih **"Open with Live Server"**
4. Browser akan otomatis terbuka

---

## ⚠️ Troubleshooting

### Port 8000 sudah digunakan?

Ganti port dengan angka lain (misalnya 8080, 3000, dll):

**Python:**
```bash
python -m http.server 8080
```

**Node.js:**
```bash
http-server -p 8080
```

**PHP:**
```bash
php -S localhost:8080
```

### Error: "Python tidak dikenali"

1. Install Python dari: https://www.python.org/downloads/
2. Pastikan centang "Add Python to PATH" saat instalasi
3. Restart terminal/command prompt

### Error: "Node tidak dikenali"

1. Install Node.js dari: https://nodejs.org/
2. Restart terminal/command prompt

### Data tidak muncul?

1. Pastikan file CSV (`data_perkuliahan.csv` dan `Matakuliah_jadwal.csv`) ada di folder yang sama
2. Pastikan Anda mengakses melalui `http://localhost:8000`, bukan `file://`
3. Buka Developer Tools (F12) dan cek tab Console untuk melihat error

---

## 📌 Catatan Penting

- **Jangan** membuka file HTML langsung dari file explorer (double-click)
- **Harus** menggunakan web server lokal karena browser membatasi akses file lokal (CORS)
- Jika data tidak muncul, pastikan server sudah berjalan dan Anda mengakses melalui `http://localhost`

---

## 🎯 Quick Start Checklist

- [ ] Buka terminal/command prompt di folder proyek
- [ ] Jalankan salah satu web server (Python/Node.js/PHP)
- [ ] Buka browser dan akses `http://localhost:8000`
- [ ] Dashboard akan muncul dengan data dari CSV

Selesai! 🎉

