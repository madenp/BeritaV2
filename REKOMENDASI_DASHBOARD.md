# Rekomendasi Tampilan Dashboard Awal (index.html)

## Analisis Data yang Tersedia

Berdasarkan analisis file-file yang ada, berikut adalah data dan statistik yang dapat ditampilkan di dashboard:

### 1. **Berita Acara** (data_perkuliahan.csv, data_perkuliahanGa26.csv)
- Total data berita acara (Genap & Ganjil)
- Total dosen yang mengajar
- Total mata kuliah
- Total pertemuan perkuliahan
- Statistik Online vs Offline (persentase)
- Distribusi perkuliahan per semester

### 2. **Jadwal** (Matakuliah_jadwal.csv)
- Total mata kuliah
- Total jadwal
- Total dosen pengajar
- Mata kuliah dengan dosen ganda

### 3. **Ketua Tingkat** (Data_ketua_tingkat.csv)
- Total ketua tingkat
- Total mata kuliah yang memiliki ketua tingkat
- Mata kuliah yang belum memiliki ketua tingkat
- Distribusi ketua tingkat per tingkatan

### 4. **Absensi Dosen** (Absensi_Dosen_Ganjil2025.csv)
- Total mata kuliah yang diabsensi
- Total pertemuan yang diabsensi
- Persentase tepat waktu vs tidak tepat waktu
- Rata-rata ketepatan waktu dosen

### 5. **Pembelajaran** (Evaluasi_RPS_MHS.csv, Evaluasi_RPS_MHS_ganjil25.csv)
- Total mata kuliah yang dievaluasi
- Rata-rata kesesuaian dengan RPS
- Rata-rata persentase kehadiran mahasiswa
- Total pertemuan pembelajaran

### 6. **Praktikum** (dari data praktikum)
- Total mata kuliah praktikum
- Rata-rata persentase kehadiran dosen
- Rata-rata persentase kehadiran mahasiswa
- Total pertemuan praktikum

---

## Rekomendasi Layout Dashboard

### **Struktur Dashboard yang Direkomendasikan:**

```
┌─────────────────────────────────────────────────────────┐
│  Welcome Card (dengan info sistem)                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  QUICK STATS - Statistik Cepat (4-6 Cards)              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │Berita│ │Jadwal│ │Dosen │ │Matkul│                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STATISTIK DETAIL - Visualisasi Data                    │
│  ┌──────────────────┐ ┌──────────────────┐              │
│  │ Online/Offline  │ │ Tepat Waktu     │              │
│  │   (Progress Bar) │ │   (Progress Bar)│              │
│  └──────────────────┘ └──────────────────┘              │
│  ┌──────────────────┐ ┌──────────────────┐              │
│  │ Kesesuaian RPS   │ │ Kehadiran MHS    │              │
│  │   (Progress Bar) │ │   (Progress Bar) │              │
│  └──────────────────┘ └──────────────────┘              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  QUICK ACCESS - Link Cepat ke Modul                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │Berita│ │Jadwal│ │Ketua │ │Absen │                   │
│  │ Acara│ │      │ │Tingkat││ Dosen│                   │
│  └──────┘ └──────┘ └──────┘ └──────┘                   │
│  ┌──────┐ ┌──────┐                                     │
│  │Pembel│ │Prakti│                                     │
│  │ajaran│ │  kum │                                     │
│  └──────┘ └──────┘                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ALERT/INFO - Informasi Penting                        │
│  - Mata kuliah tanpa ketua tingkat                      │
│  - Statistik yang perlu perhatian                       │
└─────────────────────────────────────────────────────────┘
```

---

## Detail Rekomendasi Implementasi

### **1. Welcome Card (Diperbaiki)**
```html
<div class="welcome-card">
    <h2>Selamat Datang di Dashboard</h2>
    <p>Sistem Manajemen Berita Acara dan Jadwal Perkuliahan</p>
    <div class="welcome-stats">
        <span>📊 Total Modul: 6</span>
        <span>📅 Semester Aktif: Ganjil 2025/2026</span>
    </div>
</div>
```

### **2. Quick Stats Grid (Diperluas)**
Tampilkan 6 statistik utama:
- **Berita Acara**: Total data (Genap + Ganjil)
- **Jadwal**: Total mata kuliah
- **Dosen**: Total dosen unik
- **Mata Kuliah**: Total mata kuliah unik
- **Ketua Tingkat**: Total ketua tingkat
- **Absensi**: Total pertemuan yang diabsensi

### **3. Statistik Detail dengan Progress Bar**
Tampilkan 4-6 indikator penting dengan visualisasi progress bar:
- **Persentase Online vs Offline** (dari Berita Acara)
- **Persentase Tepat Waktu** (dari Absensi Dosen)
- **Rata-rata Kesesuaian RPS** (dari Pembelajaran)
- **Rata-rata Kehadiran Mahasiswa** (dari Pembelajaran/Praktikum)
- **Rata-rata Kehadiran Dosen** (dari Praktikum)

### **4. Quick Access Cards**
Card yang dapat diklik untuk navigasi cepat ke setiap modul:
- Setiap card menampilkan icon, nama modul, dan statistik singkat
- Hover effect untuk interaktivitas
- Link langsung ke halaman modul

### **5. Alert/Info Section**
Menampilkan informasi penting:
- Mata kuliah yang belum memiliki ketua tingkat
- Statistik yang perlu perhatian (misalnya kehadiran rendah)

---

## Contoh Kode HTML yang Direkomendasikan

### **Quick Stats Grid (6 Cards)**
```html
<div class="stats-grid">
    <!-- Berita Acara -->
    <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
            <h3>Berita Acara</h3>
            <p class="stat-value" id="total-berita">0</p>
            <p class="stat-label">Total Data</p>
        </div>
    </div>
    
    <!-- Jadwal -->
    <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
            <h3>Jadwal</h3>
            <p class="stat-value" id="total-jadwal">0</p>
            <p class="stat-label">Mata Kuliah</p>
        </div>
    </div>
    
    <!-- Dosen -->
    <div class="stat-card">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-info">
            <h3>Dosen</h3>
            <p class="stat-value" id="total-dosen">0</p>
            <p class="stat-label">Total Dosen</p>
        </div>
    </div>
    
    <!-- Mata Kuliah -->
    <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
            <h3>Mata Kuliah</h3>
            <p class="stat-value" id="total-matkul">0</p>
            <p class="stat-label">Total Matkul</p>
        </div>
    </div>
    
    <!-- Ketua Tingkat -->
    <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
            <h3>Ketua Tingkat</h3>
            <p class="stat-value" id="total-ketua">0</p>
            <p class="stat-label">Total Ketua</p>
        </div>
    </div>
    
    <!-- Absensi -->
    <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
            <h3>Absensi Dosen</h3>
            <p class="stat-value" id="total-absensi">0</p>
            <p class="stat-label">Total Pertemuan</p>
        </div>
    </div>
</div>
```

### **Statistik Detail dengan Progress Bar**
```html
<div class="stats-detail-section">
    <h3>Statistik Detail</h3>
    <div class="stats-detail-grid">
        <!-- Online/Offline -->
        <div class="stat-detail-card">
            <h4>Mode Perkuliahan</h4>
            <div class="progress-group">
                <div class="progress-item">
                    <span>Online</span>
                    <div class="progress-bar">
                        <div class="progress-fill" id="online-progress" style="width: 0%; background: #10b981;"></div>
                        <span class="progress-value" id="online-value">0%</span>
                    </div>
                </div>
                <div class="progress-item">
                    <span>Offline</span>
                    <div class="progress-bar">
                        <div class="progress-fill" id="offline-progress" style="width: 0%; background: #667eea;"></div>
                        <span class="progress-value" id="offline-value">0%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Tepat Waktu -->
        <div class="stat-detail-card">
            <h4>Ketepatan Waktu Dosen</h4>
            <div class="progress-group">
                <div class="progress-item">
                    <span>Tepat Waktu</span>
                    <div class="progress-bar">
                        <div class="progress-fill" id="tepat-waktu-progress" style="width: 0%; background: #28a745;"></div>
                        <span class="progress-value" id="tepat-waktu-value">0%</span>
                    </div>
                </div>
                <div class="progress-item">
                    <span>Tidak Tepat Waktu</span>
                    <div class="progress-bar">
                        <div class="progress-fill" id="tidak-tepat-progress" style="width: 0%; background: #dc3545;"></div>
                        <span class="progress-value" id="tidak-tepat-value">0%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Kesesuaian RPS -->
        <div class="stat-detail-card">
            <h4>Kesesuaian dengan RPS</h4>
            <div class="progress-bar">
                <div class="progress-fill" id="rps-progress" style="width: 0%; background: #667eea;"></div>
                <span class="progress-value" id="rps-value">0%</span>
            </div>
        </div>
        
        <!-- Kehadiran Mahasiswa -->
        <div class="stat-detail-card">
            <h4>Kehadiran Mahasiswa</h4>
            <div class="progress-bar">
                <div class="progress-fill" id="kehadiran-mhs-progress" style="width: 0%; background: #10b981;"></div>
                <span class="progress-value" id="kehadiran-mhs-value">0%</span>
            </div>
        </div>
    </div>
</div>
```

### **Quick Access Cards**
```html
<div class="quick-access-section">
    <h3>Akses Cepat ke Modul</h3>
    <div class="quick-access-grid">
        <a href="berita-acara.html" class="quick-access-card">
            <div class="quick-icon">📝</div>
            <h4>Berita Acara</h4>
            <p>Lihat data perkuliahan</p>
        </a>
        <a href="jadwal.html" class="quick-access-card">
            <div class="quick-icon">📅</div>
            <h4>Jadwal</h4>
            <p>Lihat jadwal mata kuliah</p>
        </a>
        <a href="ketua-tingkat.html" class="quick-access-card">
            <div class="quick-icon">👥</div>
            <h4>Ketua Tingkat</h4>
            <p>Kelola ketua tingkat</p>
        </a>
        <a href="absensi-dosen.html" class="quick-access-card">
            <div class="quick-icon">📊</div>
            <h4>Absensi Dosen</h4>
            <p>Lihat absensi dosen</p>
        </a>
        <a href="pembelajaran.html" class="quick-access-card">
            <div class="quick-icon">📖</div>
            <h4>Pembelajaran</h4>
            <p>Evaluasi pembelajaran</p>
        </a>
        <a href="praktikum.html" class="quick-access-card">
            <div class="quick-icon">🔬</div>
            <h4>Praktikum</h4>
            <p>Proses praktikum</p>
        </a>
    </div>
</div>
```

---

## Fungsi JavaScript yang Perlu Ditambahkan (index.js)

### **Fungsi untuk Menghitung Statistik:**

1. **loadAllStatistics()** - Load semua data dan hitung statistik
2. **calculateOnlineOfflineStats()** - Hitung persentase online/offline
3. **calculateAbsensiStats()** - Hitung statistik absensi dosen
4. **calculatePembelajaranStats()** - Hitung statistik pembelajaran
5. **calculatePraktikumStats()** - Hitung statistik praktikum
6. **getUniqueDosen()** - Ambil daftar dosen unik
7. **getUniqueMatkul()** - Ambil daftar mata kuliah unik
8. **updateProgressBars()** - Update semua progress bar dengan animasi

---

## Prioritas Implementasi

### **Fase 1 (Prioritas Tinggi)**
1. ✅ Perluas Quick Stats Grid menjadi 6 cards
2. ✅ Tambahkan statistik dosen dan mata kuliah unik
3. ✅ Tambahkan statistik ketua tingkat dan absensi

### **Fase 2 (Prioritas Sedang)**
4. ✅ Tambahkan section Statistik Detail dengan progress bar
5. ✅ Implementasi perhitungan online/offline
6. ✅ Implementasi perhitungan tepat waktu

### **Fase 3 (Prioritas Rendah - Nice to Have)**
7. ✅ Tambahkan Quick Access Cards
8. ✅ Tambahkan Alert/Info Section
9. ✅ Tambahkan animasi loading dan transisi

---

## Catatan Penting

1. **Performance**: Karena akan load banyak CSV, pertimbangkan:
   - Load data secara parallel menggunakan `Promise.all()`
   - Cache data yang sudah di-load
   - Tampilkan loading indicator yang jelas

2. **Error Handling**: Pastikan setiap load CSV memiliki error handling yang baik

3. **Responsive Design**: Pastikan layout tetap responsif di berbagai ukuran layar

4. **User Experience**: 
   - Tampilkan "Memuat..." saat data sedang di-load
   - Berikan feedback visual saat data berhasil di-load
   - Handle kasus ketika data kosong atau error

---

## Kesimpulan

Dashboard yang direkomendasikan akan memberikan:
- **Overview lengkap** dari semua modul
- **Statistik penting** yang mudah dipahami
- **Visualisasi data** yang informatif
- **Navigasi cepat** ke modul-modul
- **Informasi penting** yang perlu perhatian

Dengan implementasi ini, dashboard akan menjadi **halaman utama yang informatif dan fungsional** untuk sistem manajemen berita acara dan jadwal perkuliahan.

