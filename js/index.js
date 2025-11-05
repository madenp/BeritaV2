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
        // Load data berita acara
        const beritaData = await loadCSV('data_perkuliahan.csv');
        const totalBeritaEl = document.getElementById('total-berita');
        if (totalBeritaEl) {
            totalBeritaEl.textContent = `${beritaData.length} Data`;
        }
        
        // Load data jadwal
        const jadwalData = await loadCSV('Matakuliah_jadwal.csv');
        const totalJadwalEl = document.getElementById('total-jadwal');
        if (totalJadwalEl) {
            totalJadwalEl.textContent = `${jadwalData.length} Data`;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        const totalBeritaEl = document.getElementById('total-berita');
        const totalJadwalEl = document.getElementById('total-jadwal');
        if (totalBeritaEl) totalBeritaEl.textContent = 'Error';
        if (totalJadwalEl) totalJadwalEl.textContent = 'Error';
    }
});

