let allJadwalData = [];
let groupedJadwalData = [];

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
    const cardsGrid = document.getElementById('jadwal-cards-grid');
    const searchInput = document.getElementById('search-jadwal');

    // Validasi elemen ada
    if (!loadingEl || !containerEl || !errorEl || !cardsGrid) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load CSV
        allJadwalData = await loadCSV('Matakuliah_jadwal.csv');
        
        if (!allJadwalData || allJadwalData.length === 0) {
            throw new Error('Data CSV kosong atau tidak valid');
        }
        
        // Debug: Log sample data
        console.log('=== JADWAL: Sample data:', allJadwalData[0]);
        console.log('=== JADWAL: Data keys:', Object.keys(allJadwalData[0]));
        console.log('=== JADWAL: Total rows:', allJadwalData.length);
        
        // Group data by "Matakuliah - Kelas"
        groupedJadwalData = groupJadwalByMatakuliah(allJadwalData);
        
        console.log('=== JADWAL: Grouped data length:', groupedJadwalData.length);
        console.log('=== JADWAL: Sample grouped data:', groupedJadwalData[0]);
        
        // Render data
        renderJadwalCards(groupedJadwalData);
        
        // Hide loading, show container
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'block';
        
        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = groupedJadwalData.filter(item => {
                    const matakuliah = (item.matakuliah || '').toLowerCase();
                    const dosen1 = (item.dosen1 || '').toLowerCase();
                    const dosen2 = (item.dosen2 || '').toLowerCase();
                    return matakuliah.includes(searchTerm) || 
                           dosen1.includes(searchTerm) || 
                           dosen2.includes(searchTerm);
                });
                renderJadwalCards(filtered);
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

// Group data by "Matakuliah - Kelas" and collect unique dosen
function groupJadwalByMatakuliah(data) {
    const grouped = {};
    
    console.log('=== GROUP JADWAL: Starting grouping, data length:', data.length);
    
    // Find column names dynamically
    let matakuliahKey = null;
    let dosenKey = null;
    
    if (data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log('=== GROUP JADWAL: Available keys:', keys);
        
        // Find matakuliah key (case-insensitive, flexible matching)
        matakuliahKey = keys.find(k => 
            k.toLowerCase().includes('matakuliah') && 
            k.toLowerCase().includes('kelas')
        );
        
        // Find dosen key (case-insensitive, flexible matching)
        dosenKey = keys.find(k => 
            k.toLowerCase().includes('dosen') && 
            k.toLowerCase().includes('nama')
        );
        
        console.log('=== GROUP JADWAL: Found matakuliahKey:', matakuliahKey);
        console.log('=== GROUP JADWAL: Found dosenKey:', dosenKey);
        
        // Fallback to exact match if not found
        if (!matakuliahKey) {
            matakuliahKey = keys.find(k => k === 'Matakuliah - Kelas') || 
                           keys.find(k => k.trim() === 'Matakuliah - Kelas');
        }
        if (!dosenKey) {
            dosenKey = keys.find(k => k === 'Nama Dosen') || 
                      keys.find(k => k.trim() === 'Nama Dosen');
        }
    }
    
    if (!matakuliahKey) {
        console.error('=== GROUP JADWAL: Could not find matakuliah column!');
        return [];
    }
    
    data.forEach((item, index) => {
        const matakuliah = (item[matakuliahKey] || '').trim();
        const dosen = dosenKey ? (item[dosenKey] || '').trim() : '';
        
        // Debug first few items
        if (index < 3) {
            console.log(`=== GROUP JADWAL: Item ${index}:`, {
                matakuliah: matakuliah,
                dosen: dosen,
                rawMatakuliah: item[matakuliahKey],
                rawDosen: dosenKey ? item[dosenKey] : 'N/A'
            });
        }
        
        if (!matakuliah) {
            console.warn(`=== GROUP JADWAL: Item ${index} has no matakuliah`);
            return;
        }
        
        if (!grouped[matakuliah]) {
            grouped[matakuliah] = {
                matakuliah: matakuliah,
                dosen: new Set()
            };
        }
        
        if (dosen) {
            grouped[matakuliah].dosen.add(dosen);
        }
    });
    
    console.log('=== GROUP JADWAL: Grouped keys count:', Object.keys(grouped).length);
    
    // Convert to array and extract dosen 1 and dosen 2
    const result = Object.values(grouped).map(item => {
        const dosenArray = Array.from(item.dosen);
        return {
            matakuliah: item.matakuliah,
            dosen1: dosenArray[0] || '',
            dosen2: dosenArray[1] || ''
        };
    }).sort((a, b) => a.matakuliah.localeCompare(b.matakuliah));
    
    console.log('=== GROUP JADWAL: Result length:', result.length);
    if (result.length > 0) {
        console.log('=== GROUP JADWAL: First result:', result[0]);
    }
    
    return result;
}

function renderJadwalCards(data) {
    const cardsGrid = document.getElementById('jadwal-cards-grid');
    
    console.log('=== RENDER JADWAL: Starting render');
    console.log('=== RENDER JADWAL: cardsGrid element:', cardsGrid);
    console.log('=== RENDER JADWAL: data length:', data ? data.length : 'null');
    
    if (!cardsGrid) {
        console.error('=== RENDER JADWAL: cardsGrid element not found!');
        return;
    }
    
    cardsGrid.innerHTML = '';
    
    if (!data || data.length === 0) {
        console.warn('=== RENDER JADWAL: No data to render');
        cardsGrid.innerHTML = '<div class="no-data">Tidak ada data ditemukan</div>';
        return;
    }
    
    console.log('=== RENDER JADWAL: Rendering', data.length, 'cards');
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'jadwal-card';
        
        card.innerHTML = `
            <div class="jadwal-card-icon">📚</div>
            <div class="jadwal-card-content">
                <h3 class="jadwal-card-title">${escapeHtml(item.matakuliah)}</h3>
                <div class="jadwal-card-details">
                    <div class="jadwal-dosen-item">
                        <span class="jadwal-dosen-label">Dosen 1:</span>
                        <span class="jadwal-dosen-value">${escapeHtml(item.dosen1 || '-')}</span>
                    </div>
                    ${item.dosen2 ? `
                    <div class="jadwal-dosen-item">
                        <span class="jadwal-dosen-label">Dosen 2:</span>
                        <span class="jadwal-dosen-value">${escapeHtml(item.dosen2)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        cardsGrid.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

