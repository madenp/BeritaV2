# Dashboard Berita Acara & Jadwal Perkuliahan

Dashboard web sederhana untuk menampilkan data Berita Acara dan Jadwal Perkuliahan dari file CSV.

## Struktur Proyek

```
BeritaV2/
├── index.html              # Halaman Utama
├── berita-acara.html       # Halaman Berita Acara
├── jadwal.html             # Halaman Jadwal
├── css/
│   └── style.css          # Styling untuk dashboard
├── js/
│   ├── main.js            # Utility functions untuk CSV parsing
│   ├── index.js           # Logic untuk halaman utama
│   ├── berita-acara.js    # Logic untuk halaman berita acara
│   └── jadwal.js          # Logic untuk halaman jadwal
├── data_perkuliahan.csv   # Database untuk berita acara
└── Matakuliah_jadwal.csv  # Database untuk jadwal
```

## Fitur

- **Halaman Utama**: Menampilkan statistik jumlah data Berita Acara dan Jadwal
- **Berita Acara**: Menampilkan data perkuliahan dengan fitur pencarian
- **Jadwal**: Menampilkan jadwal mata kuliah dengan fitur pencarian
- **Sidebar Navigation**: Navigasi mudah antar halaman
- **Responsive Design**: Tampilan yang responsif untuk berbagai ukuran layar

## Cara Menggunakan

### Menjalankan di Localhost

Karena browser membatasi akses file lokal (CORS), Anda perlu menjalankan web server lokal. Berikut beberapa cara:

#### Opsi 1: Menggunakan Python (Paling Mudah)

Jika Python sudah terinstall di komputer Anda:

**Windows:**
```bash
# Python 3
python -m http.server 8000

# Atau Python 2
python -m SimpleHTTPServer 8000
```

**Linux/Mac:**
```bash
# Python 3
python3 -m http.server 8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

#### Opsi 2: Menggunakan Node.js

Jika Node.js sudah terinstall:

1. Install http-server secara global:
```bash
npm install -g http-server
```

2. Jalankan server:
```bash
http-server -p 8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

#### Opsi 3: Menggunakan PHP

Jika PHP sudah terinstall:

```bash
php -S localhost:8000
```

Kemudian buka browser dan akses: `http://localhost:8000`

#### Opsi 4: Menggunakan VS Code Live Server

1. Install extension "Live Server" di VS Code
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

### Setelah Server Berjalan

1. Buka browser dan akses `http://localhost:8000` (atau port yang Anda gunakan)
2. Gunakan sidebar untuk navigasi antar halaman:
   - **Halaman Utama**: Tampilan dashboard dengan statistik
   - **Berita Acara**: Lihat semua data berita acara perkuliahan
   - **Jadwal**: Lihat semua jadwal mata kuliah

## Teknologi

- HTML5
- CSS3
- Vanilla JavaScript
- CSV parsing tanpa library eksternal

## Browser Support

Proyek ini menggunakan Fetch API untuk membaca file CSV, jadi memerlukan:
- Chrome/Edge (versi terbaru)
- Firefox (versi terbaru)
- Safari (versi terbaru)

## Catatan

Untuk menggunakan di localhost, pastikan file CSV berada di folder yang sama dengan file HTML. Jika menggunakan file:// protocol, beberapa browser mungkin membatasi akses file lokal karena kebijakan CORS.

## Upload ke GitHub

Proyek ini siap untuk diupload ke GitHub. Semua file sudah terorganisir dengan baik dan tidak memerlukan dependencies eksternal.

