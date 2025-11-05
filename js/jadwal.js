let allJadwalData = [];

// Load dan tampilkan data jadwal
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors (bukan dari kode kita)
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    const loadingEl = document.getElementById('loading-jadwal');
    const containerEl = document.getElementById('jadwal-container');
    const errorEl = document.getElementById('error-jadwal');
    const tableBody = document.getElementById('jadwal-table-body');
    const searchInput = document.getElementById('search-jadwal');

    // Validasi elemen ada
    if (!loadingEl || !containerEl || !errorEl) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load CSV
        allJadwalData = await loadCSV('Matakuliah_jadwal.csv');
        
        if (!allJadwalData || allJadwalData.length === 0) {
            throw new Error('Data CSV kosong atau tidak valid');
        }
        
        // Render data
        renderJadwalData(allJadwalData);
        
        // Hide loading, show container
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'block';
        
        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = allJadwalData.filter(item => {
                    return Object.values(item).some(value => 
                        value.toString().toLowerCase().includes(searchTerm)
                    );
                });
                renderJadwalData(filtered);
            });
        }
    } catch (error) {
        console.error('Error loading jadwal:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = `Error: ${error.message || 'Gagal memuat data. Pastikan server berjalan dan file CSV tersedia.'}`;
            errorEl.style.display = 'block';
        }
    }
});

function renderJadwalData(data) {
    const tableBody = document.getElementById('jadwal-table-body');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Tidak ada data ditemukan</td></tr>';
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.ID || '')}</td>
            <td>${escapeHtml(item['Nama Dosen'] || '')}</td>
            <td>${escapeHtml(item['Matakuliah - Kelas'] || '')}</td>
        `;
        tableBody.appendChild(row);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

