let allBeritaData = [];
let groupedByDosen = {};
let currentDosen = null;
let currentMatkul = null;

// Load dan tampilkan data berita acara
function initBeritaAcara() {
    console.log('=== BERITA ACARA: Script loaded ===');
    
    // Suppress extension errors (bukan dari kode kita)
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    console.log('=== BERITA ACARA: Starting initialization ===');
    const loadingEl = document.getElementById('loading-berita');
    const dosenContainer = document.getElementById('dosen-container');
    const errorEl = document.getElementById('error-berita');
    const searchInput = document.getElementById('search-berita');
    const btnBackToDosen = document.getElementById('btn-back-to-dosen');
    const btnBackToMatkul = document.getElementById('btn-back-to-matkul');

    console.log('=== BERITA ACARA: Elements found:', {
        loadingEl: !!loadingEl,
        dosenContainer: !!dosenContainer,
        errorEl: !!errorEl
    });

    // Validasi elemen ada
    if (!loadingEl || !dosenContainer || !errorEl) {
        console.error('=== BERITA ACARA: Error: Required elements not found ===');
        return;
    }

    // Async function untuk load data
    (async () => {

    try {
        console.log('=== BERITA ACARA: Loading CSV ===');
        // Load CSV
        allBeritaData = await loadCSV('data_perkuliahan.csv');
        console.log('=== BERITA ACARA: CSV loaded, rows:', allBeritaData.length);
        
        if (!allBeritaData || allBeritaData.length === 0) {
            throw new Error('Data CSV kosong atau tidak valid');
        }
        
        console.log('=== BERITA ACARA: Grouping data ===');
        // Group data berdasarkan dosen
        groupDataByDosen();
        console.log('=== BERITA ACARA: Data grouped, dosen count:', Object.keys(groupedByDosen).length);
        
        console.log('=== BERITA ACARA: Rendering cards ===');
        // Render dosen cards
        renderDosenCards();
        
        // Hide loading, show container
        if (loadingEl) loadingEl.style.display = 'none';
        if (dosenContainer) dosenContainer.style.display = 'block';
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) breadcrumb.style.display = 'block';
        
        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                filterDosenCards(searchTerm);
            });
        }
        
        // Setup back buttons
        if (btnBackToDosen) {
            btnBackToDosen.addEventListener('click', () => {
                showDosenView();
            });
        }
        
        if (btnBackToMatkul) {
            btnBackToMatkul.addEventListener('click', () => {
                if (currentDosen) {
                    showMatkulView(currentDosen);
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading berita acara:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = `Error: ${error.message || 'Gagal memuat data. Pastikan server berjalan dan file CSV tersedia.'}`;
            errorEl.style.display = 'block';
        }
    }
    })();
}

// Jalankan saat DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeritaAcara);
} else {
    // DOM sudah ready, jalankan langsung
    initBeritaAcara();
}

// Group data berdasarkan dosen dan mata kuliah
function groupDataByDosen() {
    groupedByDosen = {};
    
    allBeritaData.forEach(item => {
        const dosenName = item['Pilih Nama Dosen'] || 'Tidak Diketahui';
        const matkulName = item['Mata Kuliah'] || 'Tidak Diketahui';
        
        if (!groupedByDosen[dosenName]) {
            groupedByDosen[dosenName] = {};
        }
        
        if (!groupedByDosen[dosenName][matkulName]) {
            groupedByDosen[dosenName][matkulName] = [];
        }
        
        groupedByDosen[dosenName][matkulName].push(item);
    });
}

// Render dosen cards
function renderDosenCards(filteredDosen = null) {
    const dosenCardsEl = document.getElementById('dosen-cards');
    dosenCardsEl.innerHTML = '';
    
    const dosenList = filteredDosen || Object.keys(groupedByDosen);
    
    if (dosenList.length === 0) {
        dosenCardsEl.innerHTML = '<div class="no-data">Tidak ada data ditemukan</div>';
        return;
    }
    
    dosenList.forEach(dosenName => {
        const matkulCount = Object.keys(groupedByDosen[dosenName]).length;
        const totalPerkuliahan = Object.values(groupedByDosen[dosenName])
            .reduce((sum, arr) => sum + arr.length, 0);
        
        const card = document.createElement('div');
        card.className = 'dosen-card';
        card.innerHTML = `
            <div class="card-icon">👨‍🏫</div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(dosenName)}</h3>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">Mata Kuliah</span>
                        <span class="stat-value">${matkulCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Perkuliahan</span>
                        <span class="stat-value">${totalPerkuliahan}</span>
                    </div>
                </div>
            </div>
            <div class="card-arrow">→</div>
        `;
        
        card.addEventListener('click', () => {
            showMatkulView(dosenName);
        });
        
        dosenCardsEl.appendChild(card);
    });
}

// Filter dosen cards berdasarkan search
function filterDosenCards(searchTerm) {
    if (!searchTerm) {
        renderDosenCards();
        return;
    }
    
    const filtered = Object.keys(groupedByDosen).filter(dosenName => 
        dosenName.toLowerCase().includes(searchTerm)
    );
    
    renderDosenCards(filtered);
}

// Show mata kuliah view
function showMatkulView(dosenName) {
    currentDosen = dosenName;
    currentMatkul = null;
    
    // Hide all containers
    document.getElementById('dosen-container').style.display = 'none';
    document.getElementById('detail-container').style.display = 'none';
    
    // Show mata kuliah container
    const matkulContainer = document.getElementById('matkul-container');
    matkulContainer.style.display = 'block';
    
    // Update header
    document.getElementById('dosen-name-header').textContent = dosenName;
    const matkulCount = Object.keys(groupedByDosen[dosenName]).length;
    const totalPerkuliahan = Object.values(groupedByDosen[dosenName])
        .reduce((sum, arr) => sum + arr.length, 0);
    document.getElementById('dosen-info-header').textContent = 
        `${matkulCount} Mata Kuliah • ${totalPerkuliahan} Total Perkuliahan`;
    
    // Update breadcrumb
    document.getElementById('btn-back-to-dosen').style.display = 'block';
    document.getElementById('btn-back-to-matkul').style.display = 'none';
    
    // Render mata kuliah cards
    renderMatkulCards(dosenName);
}

// Render mata kuliah cards
function renderMatkulCards(dosenName) {
    const matkulCardsEl = document.getElementById('matkul-cards');
    matkulCardsEl.innerHTML = '';
    
    const matkulList = Object.keys(groupedByDosen[dosenName]);
    
    matkulList.forEach(matkulName => {
        const perkuliahanList = groupedByDosen[dosenName][matkulName];
        const pertemuanCount = perkuliahanList.length;
        
        const card = document.createElement('div');
        card.className = 'matkul-card';
        card.innerHTML = `
            <div class="card-icon">📚</div>
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(matkulName)}</h3>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Pertemuan</span>
                        <span class="stat-value">${pertemuanCount}</span>
                    </div>
                </div>
            </div>
            <div class="card-arrow">→</div>
        `;
        
        card.addEventListener('click', () => {
            showDetailView(dosenName, matkulName);
        });
        
        matkulCardsEl.appendChild(card);
    });
}

// Show detail view
function showDetailView(dosenName, matkulName) {
    currentDosen = dosenName;
    currentMatkul = matkulName;
    
    // Hide all containers
    document.getElementById('dosen-container').style.display = 'none';
    document.getElementById('matkul-container').style.display = 'none';
    
    // Show detail container
    const detailContainer = document.getElementById('detail-container');
    detailContainer.style.display = 'block';
    
    // Update header
    document.getElementById('matkul-name-header').textContent = matkulName;
    document.getElementById('matkul-info-header').textContent = `Dosen: ${dosenName}`;
    
    // Update breadcrumb
    document.getElementById('btn-back-to-dosen').style.display = 'none';
    document.getElementById('btn-back-to-matkul').style.display = 'block';
    
    // Render detail table
    renderDetailTable(dosenName, matkulName);
}

// Helper function untuk mencari key yang tepat (case-insensitive dan handle spasi)
function findKey(obj, possibleKeys) {
    const objKeys = Object.keys(obj);
    
    // Cari exact match terlebih dahulu
    for (const key of possibleKeys) {
        if (objKeys.includes(key)) {
            return obj[key];
        }
    }
    
    // Cari case-insensitive match
    for (const key of possibleKeys) {
        const foundKey = objKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
        if (foundKey) {
            return obj[foundKey];
        }
    }
    
    return '';
}

// Render detail table
function renderDetailTable(dosenName, matkulName) {
    const tableBody = document.getElementById('detail-table-body');
    tableBody.innerHTML = '';
    
    const perkuliahanList = groupedByDosen[dosenName][matkulName];
    
    if (perkuliahanList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Tidak ada data</td></tr>';
        return;
    }
    
    // Debug: Log keys dari item pertama untuk melihat struktur
    if (perkuliahanList.length > 0) {
        const sampleItem = perkuliahanList[0];
        console.log('Sample item keys:', Object.keys(sampleItem));
        console.log('Sample item:', sampleItem);
        
        // Debug specific keys
        console.log('Lama Perkualiahan (with space):', JSON.stringify(sampleItem['Lama Perkualiahan ']));
        console.log('Lama Perkualiahan (without space):', JSON.stringify(sampleItem['Lama Perkualiahan']));
        console.log('Materi yang diberikan (with space):', JSON.stringify(sampleItem['Materi yang diberikan ']));
        console.log('Materi yang diberikan (without space):', JSON.stringify(sampleItem['Materi yang diberikan']));
    }
    
    // Sort by pertemuan ke
    perkuliahanList.sort((a, b) => {
        const pertA = parseInt(a['Petemuan Ke']) || 0;
        const pertB = parseInt(b['Petemuan Ke']) || 0;
        return pertA - pertB;
    });
    
    perkuliahanList.forEach(item => {
        // Cari key untuk Lama Perkuliahan - coba semua variasi yang mungkin
        let lamaPerkuliahan = '';
        const lamaKeys = [
            'Lama Perkualiahan ',
            'Lama Perkualiahan',
            'Lama Perkuliahan ',
            'Lama Perkuliahan'
        ];
        
        for (const key of lamaKeys) {
            if (item.hasOwnProperty(key) && item[key]) {
                lamaPerkuliahan = item[key];
                break;
            }
        }
        
        // Jika masih kosong, coba dengan case-insensitive
        if (!lamaPerkuliahan) {
            const itemKeys = Object.keys(item);
            const foundKey = itemKeys.find(k => 
                k.toLowerCase().replace(/\s+/g, ' ') === 'lama perkualiahan' ||
                k.toLowerCase().replace(/\s+/g, ' ') === 'lama perkuliahan'
            );
            if (foundKey) {
                lamaPerkuliahan = item[foundKey];
            }
        }
        
        // Cari key untuk Materi - coba semua variasi yang mungkin
        let materi = '';
        const materiKeys = [
            'Materi yang diberikan ',
            'Materi yang diberikan',
            'Materi yang Diberikan ',
            'Materi yang Diberikan'
        ];
        
        for (const key of materiKeys) {
            if (item.hasOwnProperty(key) && item[key]) {
                materi = item[key];
                break;
            }
        }
        
        // Jika masih kosong, coba dengan case-insensitive
        if (!materi) {
            const itemKeys = Object.keys(item);
            const foundKey = itemKeys.find(k => 
                k.toLowerCase().replace(/\s+/g, ' ').includes('materi yang diberikan')
            );
            if (foundKey) {
                materi = item[foundKey];
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item['Petemuan Ke'] || '')}</td>
            <td>${escapeHtml(item['Tanggal'] || '')}</td>
            <td>${escapeHtml(item['Keterangan'] || '')}</td>
            <td>${escapeHtml(lamaPerkuliahan)}</td>
            <td>${escapeHtml(materi)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Show dosen view
function showDosenView() {
    currentDosen = null;
    currentMatkul = null;
    
    // Hide all containers
    document.getElementById('matkul-container').style.display = 'none';
    document.getElementById('detail-container').style.display = 'none';
    
    // Show dosen container
    document.getElementById('dosen-container').style.display = 'block';
    
    // Update breadcrumb
    document.getElementById('btn-back-to-dosen').style.display = 'none';
    document.getElementById('btn-back-to-matkul').style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
