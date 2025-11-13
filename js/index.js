// Load statistics untuk halaman utama
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors (bukan dari kode kita)
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    try {
        // Load semua data secara parallel
        await loadAllStatistics();
    } catch (error) {
        console.error('Error loading statistics:', error);
        updateErrorStates();
    }
});

// Load semua statistik
async function loadAllStatistics() {
    try {
        // Load semua CSV secara parallel
        const [
            beritaGenap,
            beritaGanjil,
            jadwalData,
            ketuaTingkatData,
            absensiData,
            pembelajaranGenap,
            pembelajaranGanjil
        ] = await Promise.all([
            loadCSV('data_perkuliahan.csv').catch(() => []),
            loadCSV('data_perkuliahanGa26.csv').catch(() => []),
            loadCSV('Matakuliah_jadwal.csv').catch(() => []),
            loadCSV('Data_ketua_tingkat.csv').catch(() => []),
            loadCSV('Absensi_Dosen_Ganjil2025.csv').catch(() => []),
            loadCSV('Evaluasi_RPS_MHS.csv').catch(() => []),
            loadCSV('Evaluasi_RPS_MHS_ganjil25.csv').catch(() => [])
        ]);

        // Update Quick Stats
        updateQuickStats({
            beritaGenap,
            beritaGanjil,
            jadwalData,
            ketuaTingkatData,
            absensiData
        });

        // Update Statistik Detail
        updateDetailStats({
            beritaGenap,
            beritaGanjil,
            absensiData,
            pembelajaranGenap,
            pembelajaranGanjil
        });

        // Update Alert Section
        updateAlertSection(jadwalData, ketuaTingkatData);

    } catch (error) {
        console.error('Error in loadAllStatistics:', error);
        throw error;
    }
}

// Update Quick Stats
function updateQuickStats(data) {
    const { beritaGenap, beritaGanjil, jadwalData, ketuaTingkatData, absensiData } = data;

    // Total Berita Acara
    const totalBerita = (beritaGenap.length || 0) + (beritaGanjil.length || 0);
    updateElement('total-berita', totalBerita.toLocaleString('id-ID'));

    // Total Jadwal (unique mata kuliah)
    const uniqueJadwal = getUniqueMatkulFromJadwal(jadwalData);
    updateElement('total-jadwal', uniqueJadwal.length.toLocaleString('id-ID'));

    // Total Dosen (unique dari berita acara)
    const uniqueDosen = getUniqueDosen(beritaGenap, beritaGanjil);
    updateElement('total-dosen', uniqueDosen.length.toLocaleString('id-ID'));

    // Total Mata Kuliah (unique dari berita acara dan jadwal)
    const uniqueMatkul = getUniqueMatkul(beritaGenap, beritaGanjil, jadwalData);
    updateElement('total-matkul', uniqueMatkul.length.toLocaleString('id-ID'));

    // Total Ketua Tingkat
    const uniqueKetua = getUniqueKetuaTingkat(ketuaTingkatData);
    updateElement('total-ketua', uniqueKetua.length.toLocaleString('id-ID'));

    // Total Absensi (total pertemuan)
    updateElement('total-absensi', (absensiData.length || 0).toLocaleString('id-ID'));
}

// Update Statistik Detail dengan Progress Bar
function updateDetailStats(data) {
    const { beritaGenap, beritaGanjil, absensiData, pembelajaranGenap, pembelajaranGanjil } = data;

    // Hitung Online/Offline
    const onlineOfflineStats = calculateOnlineOfflineStats(beritaGenap, beritaGanjil);
    updateProgressBar('online-progress', 'online-value', onlineOfflineStats.onlinePercentage);
    updateProgressBar('offline-progress', 'offline-value', onlineOfflineStats.offlinePercentage);

    // Hitung Tepat Waktu
    const absensiStats = calculateAbsensiStats(absensiData);
    updateProgressBar('tepat-waktu-progress', 'tepat-waktu-value', absensiStats.tepatWaktuPercent);
    updateProgressBar('tidak-tepat-progress', 'tidak-tepat-value', absensiStats.tidakTepatWaktuPercent);

    // Hitung Kesesuaian RPS
    const rpsStats = calculateRPSStats(pembelajaranGenap, pembelajaranGanjil);
    updateProgressBar('rps-progress', 'rps-value', rpsStats.averageCompliance);

    // Hitung Kehadiran Mahasiswa
    const kehadiranStats = calculateKehadiranStats(pembelajaranGenap, pembelajaranGanjil);
    updateProgressBar('kehadiran-mhs-progress', 'kehadiran-mhs-value', kehadiranStats.averageAttendance);
}

// Helper: Update element text
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

// Helper: Update progress bar dengan animasi
function updateProgressBar(progressId, valueId, percentage) {
    const progressEl = document.getElementById(progressId);
    const valueEl = document.getElementById(valueId);
    
    if (progressEl && valueEl) {
        const percent = Math.round(percentage || 0);
        valueEl.textContent = `${percent}%`;
        
        // Animate progress bar
        setTimeout(() => {
            progressEl.style.width = `${percent}%`;
        }, 100);
    }
}

// Helper: Get unique dosen dari berita acara
function getUniqueDosen(beritaGenap, beritaGanjil) {
    const dosenSet = new Set();
    
    [...(beritaGenap || []), ...(beritaGanjil || [])].forEach(item => {
        const dosen = item['Pilih Nama Dosen'] || item['Nama Dosen'] || '';
        if (dosen && dosen.trim()) {
            dosenSet.add(dosen.trim());
        }
    });
    
    return Array.from(dosenSet);
}

// Helper: Get unique mata kuliah
function getUniqueMatkul(beritaGenap, beritaGanjil, jadwalData) {
    const matkulSet = new Set();
    
    // Dari berita acara
    [...(beritaGenap || []), ...(beritaGanjil || [])].forEach(item => {
        const matkul = item['Mata Kuliah'] || '';
        if (matkul && matkul.trim()) {
            matkulSet.add(matkul.trim());
        }
    });
    
    // Dari jadwal
    (jadwalData || []).forEach(item => {
        const matkulKelas = item['Matakuliah - Kelas'] || item['Mata Kuliah - Kelas'] || '';
        if (matkulKelas && matkulKelas.trim()) {
            // Extract mata kuliah name (before " - Kelas")
            const matkul = matkulKelas.split(' - Kelas')[0].trim();
            if (matkul) {
                matkulSet.add(matkul);
            }
        }
    });
    
    return Array.from(matkulSet);
}

// Helper: Get unique mata kuliah dari jadwal
function getUniqueMatkulFromJadwal(jadwalData) {
    const matkulSet = new Set();
    
    (jadwalData || []).forEach(item => {
        const matkulKelas = item['Matakuliah - Kelas'] || item['Mata Kuliah - Kelas'] || '';
        if (matkulKelas && matkulKelas.trim()) {
            matkulSet.add(matkulKelas.trim());
        }
    });
    
    return Array.from(matkulSet);
}

// Helper: Get unique ketua tingkat
function getUniqueKetuaTingkat(ketuaTingkatData) {
    const ketuaSet = new Set();
    
    (ketuaTingkatData || []).forEach(item => {
        const nama = item['Nama'] || item['Nama Ketua'] || '';
        const nim = item['NIM'] || '';
        if (nama && nama.trim()) {
            ketuaSet.add(`${nama.trim()}_${nim || ''}`);
        }
    });
    
    return Array.from(ketuaSet);
}

// Calculate Online/Offline Statistics
function calculateOnlineOfflineStats(beritaGenap, beritaGanjil) {
    let onlineCount = 0;
    let offlineCount = 0;
    
    [...(beritaGenap || []), ...(beritaGanjil || [])].forEach(item => {
        const keterangan = (item['Keterangan'] || '').toLowerCase().trim();
        if (keterangan === 'online') {
            onlineCount++;
        } else if (keterangan === 'offline') {
            offlineCount++;
        }
    });
    
    const total = onlineCount + offlineCount;
    const onlinePercentage = total > 0 ? (onlineCount / total) * 100 : 0;
    const offlinePercentage = total > 0 ? (offlineCount / total) * 100 : 0;
    
    return {
        online: onlineCount,
        offline: offlineCount,
        total: total,
        onlinePercentage: onlinePercentage,
        offlinePercentage: offlinePercentage
    };
}

// Calculate Absensi Statistics
function calculateAbsensiStats(absensiData) {
    let tepatWaktu = 0;
    let tidakTepatWaktu = 0;
    let total = 0;
    
    (absensiData || []).forEach(row => {
        const kesesuaian = (getColumnValue(row, 'Kesesuaian') || '').toString().trim().toLowerCase();
        total++;
        
        if (kesesuaian === 'tepat waktu') {
            tepatWaktu++;
        } else if (kesesuaian === 'tidak tepat waktu') {
            tidakTepatWaktu++;
        }
    });
    
    const tepatWaktuPercent = total > 0 ? (tepatWaktu / total) * 100 : 0;
    const tidakTepatWaktuPercent = total > 0 ? (tidakTepatWaktu / total) * 100 : 0;
    
    return {
        tepatWaktu: tepatWaktu,
        tidakTepatWaktu: tidakTepatWaktu,
        total: total,
        tepatWaktuPercent: tepatWaktuPercent,
        tidakTepatWaktuPercent: tidakTepatWaktuPercent
    };
}

// Helper: Get column value (similar to absensi-dosen.js)
function getColumnValue(row, columnName) {
    if (row[columnName] !== undefined) {
        return row[columnName];
    }
    if (row[columnName + ' '] !== undefined) {
        return row[columnName + ' '];
    }
    const keys = Object.keys(row);
    const foundKey = keys.find(key => key.trim().toLowerCase() === columnName.toLowerCase());
    if (foundKey) {
        return row[foundKey];
    }
    return '';
}

// Calculate RPS Compliance Statistics
function calculateRPSStats(pembelajaranGenap, pembelajaranGanjil) {
    let sesuaiCount = 0;
    let totalCount = 0;
    
    [...(pembelajaranGenap || []), ...(pembelajaranGanjil || [])].forEach(row => {
        const kesesuaian = (getColumnValue(row, 'Kesesuaian dengan RPS') || '').toString().trim().toLowerCase();
        if (kesesuaian) {
            totalCount++;
            if (kesesuaian === 'sesuai') {
                sesuaiCount++;
            }
        }
    });
    
    const averageCompliance = totalCount > 0 ? (sesuaiCount / totalCount) * 100 : 0;
    
    return {
        sesuai: sesuaiCount,
        total: totalCount,
        averageCompliance: averageCompliance
    };
}

// Calculate Kehadiran Mahasiswa Statistics
function calculateKehadiranStats(pembelajaranGenap, pembelajaranGanjil) {
    let totalPercentage = 0;
    let meetingCount = 0;
    
    [...(pembelajaranGenap || []), ...(pembelajaranGanjil || [])].forEach(row => {
        const jumlahMahasiswa = parseInt(getColumnValue(row, 'Jumlah Mahasiswa')) || 0;
        const mahasiswaHadir = parseInt(getColumnValue(row, 'Mahasiswa Hadir')) || 0;
        
        if (jumlahMahasiswa > 0) {
            const percentage = (mahasiswaHadir / jumlahMahasiswa) * 100;
            totalPercentage += percentage;
            meetingCount++;
        }
    });
    
    const averageAttendance = meetingCount > 0 ? (totalPercentage / meetingCount) : 0;
    
    return {
        averageAttendance: averageAttendance,
        totalMeetings: meetingCount
    };
}

// Update Alert Section
function updateAlertSection(jadwalData, ketuaTingkatData) {
    const alertSection = document.getElementById('alert-section');
    const alertContent = document.getElementById('alert-content');
    
    if (!alertSection || !alertContent) return;
    
    // Cek mata kuliah tanpa ketua tingkat
    const matkulWithKetua = new Set();
    (ketuaTingkatData || []).forEach(item => {
        const matkul = item['Mata Kuliah'] || item['Mata Kuliah '] || '';
        if (matkul && matkul.trim()) {
            matkulWithKetua.add(matkul.trim());
        }
    });
    
    const matkulWithoutKetua = [];
    (jadwalData || []).forEach(item => {
        const matkulKelas = item['Matakuliah - Kelas'] || item['Mata Kuliah - Kelas'] || '';
        if (matkulKelas && matkulKelas.trim()) {
            const matkul = matkulKelas.split(' - Kelas')[0].trim();
            if (matkul && !matkulWithKetua.has(matkul)) {
                if (!matkulWithoutKetua.includes(matkul)) {
                    matkulWithoutKetua.push(matkul);
                }
            }
        }
    });
    
    if (matkulWithoutKetua.length > 0) {
        let html = '<div class="alert-item">';
        html += `<strong>⚠️ ${matkulWithoutKetua.length} Mata Kuliah Belum Memiliki Ketua Tingkat:</strong>`;
        html += '<ul style="margin-top: 10px; padding-left: 20px;">';
        matkulWithoutKetua.slice(0, 5).forEach(matkul => {
            html += `<li>${escapeHtml(matkul)}</li>`;
        });
        if (matkulWithoutKetua.length > 5) {
            html += `<li>... dan ${matkulWithoutKetua.length - 5} lainnya</li>`;
        }
        html += '</ul></div>';
        alertContent.innerHTML = html;
        alertSection.style.display = 'block';
    }
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update Error States
function updateErrorStates() {
    const elements = [
        'total-berita', 'total-jadwal', 'total-dosen', 
        'total-matkul', 'total-ketua', 'total-absensi'
    ];
    
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Error';
    });
}

