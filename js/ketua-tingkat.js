let ketuaTingkatData = [];
let jadwalData = [];
let currentSection = 'matkul'; // 'matkul' or 'ketua'
let selectedKetua = null;
let filteredMatkulData = [];
let filteredKetuaData = [];

// Load dan tampilkan data ketua tingkat
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    const loadingEl = document.getElementById('loading-ketua');
    const errorEl = document.getElementById('error-ketua');
    const matkulSection = document.getElementById('matkul-section');
    const ketuaSection = document.getElementById('ketua-section');
    const detailMatkulSection = document.getElementById('detail-matkul-section');
    const searchInput = document.getElementById('search-ketua');
    const tabMatkul = document.getElementById('tab-matkul');
    const tabKetua = document.getElementById('tab-ketua');
    const btnBackToKetua = document.getElementById('btn-back-to-ketua');

    // Validasi elemen
    if (!loadingEl || !errorEl) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load kedua CSV file
        console.log('Loading Data_ketua_tingkat.csv...');
        ketuaTingkatData = await loadCSV('Data_ketua_tingkat.csv');
        
        console.log('Loading Matakuliah_jadwal.csv...');
        jadwalData = await loadCSV('Matakuliah_jadwal.csv');
        
        if (!ketuaTingkatData || ketuaTingkatData.length === 0) {
            throw new Error('Data ketua tingkat CSV kosong atau tidak valid');
        }
        
        if (!jadwalData || jadwalData.length === 0) {
            throw new Error('Data jadwal CSV kosong atau tidak valid');
        }

        console.log('Data loaded:', {
            ketuaTingkat: ketuaTingkatData.length,
            jadwal: jadwalData.length
        });

        // Debug: Log sample data
        if (ketuaTingkatData.length > 0) {
            console.log('Sample ketua tingkat data:', ketuaTingkatData[0]);
            console.log('Ketua tingkat keys:', Object.keys(ketuaTingkatData[0]));
        }
        if (jadwalData.length > 0) {
            console.log('Sample jadwal data:', jadwalData[0]);
            console.log('Jadwal keys:', Object.keys(jadwalData[0]));
        }

        // Process data
        processData();

        // Render initial section (Mata Kuliah)
        renderMatkulSection();

        // Hide loading, show section
        loadingEl.style.display = 'none';
        matkulSection.style.display = 'block';

        // Setup tab switching
        tabMatkul.addEventListener('click', () => {
            switchSection('matkul');
        });

        tabKetua.addEventListener('click', () => {
            switchSection('ketua');
        });

        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                filterData(searchTerm);
            });
        }

        // Setup back button
        if (btnBackToKetua) {
            btnBackToKetua.addEventListener('click', () => {
                detailMatkulSection.style.display = 'none';
                ketuaSection.style.display = 'block';
                selectedKetua = null;
            });
        }

    } catch (error) {
        console.error('Error loading ketua tingkat:', error);
        loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = `Error: ${error.message || 'Gagal memuat data. Pastikan server berjalan dan file CSV tersedia.'}`;
            errorEl.style.display = 'block';
        }
    }
});

// Process data: match jadwal dengan ketua tingkat
function processData() {
    // Create a map of mata kuliah from jadwal
    // Kolom di Matakuliah_jadwal.csv adalah "Matakuliah - Kelas"
    const jadwalMap = {};
    
    // Debug: check available keys
    if (jadwalData.length > 0) {
        console.log('Available keys in jadwal data:', Object.keys(jadwalData[0]));
    }
    
    jadwalData.forEach((item, index) => {
        // Try different possible column names with variations
        let matkulKelas = item['Matakuliah - Kelas'] || 
                         item['Mata Kuliah - Kelas'] || 
                         item['Matakuliah- Kelas'] ||
                         item['Matakuliah - Kelas '] || // with trailing space
                         '';
        
        // Try to find the column dynamically if exact match fails
        if (!matkulKelas) {
            const keys = Object.keys(item);
            const matkulKey = keys.find(k => 
                k.toLowerCase().includes('matakuliah') && 
                k.toLowerCase().includes('kelas')
            );
            if (matkulKey) {
                matkulKelas = item[matkulKey] || '';
            }
        }
        
        if (matkulKelas && matkulKelas.trim() !== '') {
            matkulKelas = matkulKelas.trim();
            // Keep unique entries - if duplicate exists, keep first one
            if (!jadwalMap[matkulKelas]) {
                jadwalMap[matkulKelas] = item;
            }
        } else if (index < 3) {
            // Log first few items that don't match for debugging
            console.warn('Item without matkul kelas (index', index, '):', item);
        }
    });

    console.log('Jadwal map created with', Object.keys(jadwalMap).length, 'unique mata kuliah');

    // Create a map of ketua tingkat by mata kuliah
    // Kolom di Data_ketua_tingkat.csv adalah "Mata Kuliah"
    const ketuaMap = {};
    
    // Debug: check available keys
    if (ketuaTingkatData.length > 0) {
        console.log('Available keys in ketua tingkat data:', Object.keys(ketuaTingkatData[0]));
    }
    
    ketuaTingkatData.forEach((item, index) => {
        let matkulKelas = item['Mata Kuliah'] || 
                         item['Mata Kuliah '] || // with trailing space
                         '';
        
        // Try to find the column dynamically if exact match fails
        if (!matkulKelas) {
            const keys = Object.keys(item);
            const matkulKey = keys.find(k => 
                k.toLowerCase().includes('mata') && 
                k.toLowerCase().includes('kuliah')
            );
            if (matkulKey) {
                matkulKelas = item[matkulKey] || '';
            }
        }
        
        // Debug: log sample item structure
        if (index === 0) {
            console.log('Sample ketua tingkat item:', item);
            console.log('Sample ketua tingkat keys:', Object.keys(item));
            console.log('Sample No WhatsApp value:', item['No WhatsApp'], item['No WhatsApp '], item['NoWhatsApp']);
        }
        
        if (matkulKelas && matkulKelas.trim() !== '') {
            matkulKelas = matkulKelas.trim();
            if (!ketuaMap[matkulKelas]) {
                ketuaMap[matkulKelas] = [];
            }
            ketuaMap[matkulKelas].push(item);
        } else if (index < 3) {
            // Log first few items that don't match for debugging
            console.warn('Item without mata kuliah (index', index, '):', item);
        }
    });

    console.log('Ketua map created with', Object.keys(ketuaMap).length, 'unique mata kuliah');

    // Store processed data
    window.processedKetuaMap = ketuaMap;
    window.processedJadwalMap = jadwalMap;
}

// Switch between sections
function switchSection(section) {
    currentSection = section;
    const matkulSection = document.getElementById('matkul-section');
    const ketuaSection = document.getElementById('ketua-section');
    const detailMatkulSection = document.getElementById('detail-matkul-section');
    const tabMatkul = document.getElementById('tab-matkul');
    const tabKetua = document.getElementById('tab-ketua');

    // Reset detail view
    detailMatkulSection.style.display = 'none';
    selectedKetua = null;

    // Update tabs
    tabMatkul.classList.remove('active');
    tabKetua.classList.remove('active');

    if (section === 'matkul') {
        tabMatkul.classList.add('active');
        matkulSection.style.display = 'block';
        ketuaSection.style.display = 'none';
        renderMatkulSection();
    } else {
        tabKetua.classList.add('active');
        matkulSection.style.display = 'none';
        ketuaSection.style.display = 'block';
        renderKetuaSection();
    }

    // Clear search
    const searchInput = document.getElementById('search-ketua');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Filter data based on search
function filterData(searchTerm) {
    if (currentSection === 'matkul') {
        filterMatkulData(searchTerm);
    } else {
        filterKetuaData(searchTerm);
    }
}

function filterMatkulData(searchTerm) {
    filteredMatkulData = [];
    const ketuaMap = window.processedKetuaMap || {};
    const jadwalMap = window.processedJadwalMap || {};

    console.log('Filtering matkul data - jadwalMap size:', Object.keys(jadwalMap).length);
    console.log('Filtering matkul data - ketuaMap size:', Object.keys(ketuaMap).length);

    // Get all unique mata kuliah from jadwal
    // Data diambil dari Matakuliah_jadwal.csv kolom "Matakuliah - Kelas"
    const allMatkul = new Set();
    Object.keys(jadwalMap).forEach(matkul => {
        if (matkul && matkul.trim() !== '') {
            allMatkul.add(matkul);
        }
    });

    console.log('Total unique mata kuliah from jadwal:', allMatkul.size);

    allMatkul.forEach(matkulKelas => {
        // Match dengan Data_ketua_tingkat.csv kolom "Mata Kuliah"
        const ketuaList = ketuaMap[matkulKelas] || [];
        const jadwalInfo = jadwalMap[matkulKelas] || {};

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matches = 
                matkulKelas.toLowerCase().includes(searchLower) ||
                ketuaList.some(k => 
                    (k.Nama || '').toLowerCase().includes(searchLower) ||
                    (k['No WhatsApp'] || '').includes(searchTerm)
                );
            if (!matches) return;
        }

        filteredMatkulData.push({
            matkulKelas,
            ketuaList,
            jadwalInfo,
            hasKetua: ketuaList.length > 0
        });
    });

    console.log('Filtered matkul data count:', filteredMatkulData.length);
    renderMatkulCards();
}

function filterKetuaData(searchTerm) {
    filteredKetuaData = [];
    const ketuaMap = window.processedKetuaMap || {};
    
    // Group by ketua tingkat
    const ketuaGroup = {};
    
    Object.keys(ketuaMap).forEach(matkulKelas => {
        ketuaMap[matkulKelas].forEach(ketua => {
            // Get Nama dengan dynamic lookup
            let nama = ketua.Nama || ketua['Nama'] || '';
            if (!nama) {
                const namaKey = Object.keys(ketua).find(k => k.toLowerCase().includes('nama') && !k.toLowerCase().includes('whatsapp'));
                if (namaKey) {
                    nama = ketua[namaKey] || '';
                }
            }
            
            // Get NIM dengan dynamic lookup
            let nim = ketua.NIM || ketua['NIM'] || '';
            if (!nim) {
                const nimKey = Object.keys(ketua).find(k => k.toLowerCase().includes('nim'));
                if (nimKey) nim = ketua[nimKey] || '';
            }
            
            // Get No WhatsApp dengan dynamic lookup
            let noWhatsApp = ketua['No WhatsApp'] || ketua['No WhatsApp '] || ketua['NoWhatsApp'] || '';
            if (!noWhatsApp) {
                const whatsappKey = Object.keys(ketua).find(k => k.toLowerCase().includes('whatsapp'));
                if (whatsappKey) noWhatsApp = ketua[whatsappKey] || '';
            }
            
            const key = `${nama}_${nim}_${noWhatsApp}`;
            if (!ketuaGroup[key]) {
                ketuaGroup[key] = {
                    nama: nama,
                    nim: nim,
                    noWhatsApp: noWhatsApp,
                    matkulList: []
                };
            }
            ketuaGroup[key].matkulList.push(matkulKelas);
        });
    });

    Object.keys(ketuaGroup).forEach(key => {
        const ketua = ketuaGroup[key];
        
        if (searchTerm) {
            const matches = 
                ketua.nama.toLowerCase().includes(searchTerm) ||
                ketua.nim.toLowerCase().includes(searchTerm) ||
                ketua.noWhatsApp.includes(searchTerm);
            if (!matches) return;
        }

        filteredKetuaData.push(ketua);
    });

    renderKetuaCards();
}

// Render Mata Kuliah Section
function renderMatkulSection() {
    filterMatkulData('');
}

function renderMatkulCards() {
    const cardsContainer = document.getElementById('matkul-cards');
    const noDataEl = document.getElementById('matkul-no-data');
    
    if (!cardsContainer) {
        console.error('matkul-cards container not found!');
        return;
    }

    cardsContainer.innerHTML = '';

    console.log('Rendering matkul cards, filteredMatkulData length:', filteredMatkulData.length);

    if (filteredMatkulData.length === 0) {
        console.log('No matkul data to display');
        if (noDataEl) noDataEl.style.display = 'block';
        return;
    }

    if (noDataEl) noDataEl.style.display = 'none';

    filteredMatkulData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'matkul-card';

        if (!item.hasKetua) {
            card.style.borderColor = '#f59e0b';
            card.style.opacity = '0.8';
        }

        let ketuaInfo = '';
        if (item.ketuaList.length > 0) {
            const ketua = item.ketuaList[0]; // Take first ketua
            
            // Get Nama dengan dynamic lookup
            let nama = ketua.Nama || ketua['Nama'] || '';
            if (!nama) {
                const namaKey = Object.keys(ketua).find(k => k.toLowerCase().includes('nama') && !k.toLowerCase().includes('whatsapp'));
                if (namaKey) {
                    nama = ketua[namaKey] || '';
                }
            }
            
            // Get No WhatsApp dengan dynamic lookup - coba semua variasi
            let noWhatsApp = ketua['No WhatsApp'] || 
                           ketua['No WhatsApp '] || 
                           ketua['NoWhatsApp'] ||
                           '';
            
            // Jika masih kosong, cari secara dinamis
            if (!noWhatsApp || noWhatsApp.trim() === '') {
                const whatsappKey = Object.keys(ketua).find(k => k.toLowerCase().includes('whatsapp'));
                if (whatsappKey) {
                    noWhatsApp = ketua[whatsappKey] || '';
                }
            }
            
            // Debug untuk beberapa item pertama
            if (filteredMatkulData.indexOf(item) < 3) {
                console.log('Ketua data for', item.matkulKelas, ':', {
                    allKeys: Object.keys(ketua),
                    directAccess: ketua['No WhatsApp'],
                    foundKey: Object.keys(ketua).find(k => k.toLowerCase().includes('whatsapp')),
                    noWhatsApp: noWhatsApp
                });
            }
            
            ketuaInfo = `
                <div class="stat-item">
                    <span class="stat-label">Ketua Tingkat</span>
                    <span class="stat-value">${escapeHtml(nama || '-')}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">No WhatsApp</span>
                    <span class="stat-value">${escapeHtml(noWhatsApp || '-')}</span>
                </div>
            `;
        } else {
            ketuaInfo = `
                <div class="stat-item">
                    <span class="stat-label" style="color: #f59e0b;">⚠ Belum Ada Ketua Tingkat</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-icon">📚</div>
            <div class="card-content">
                <div class="card-title">${escapeHtml(item.matkulKelas)}</div>
                <div class="card-stats">
                    ${ketuaInfo}
                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });

    console.log('Matkul cards rendered:', cardsContainer.children.length);
}

// Render Ketua Tingkat Section
function renderKetuaSection() {
    filterKetuaData('');
}

function renderKetuaCards() {
    const cardsContainer = document.getElementById('ketua-cards');
    const noDataEl = document.getElementById('ketua-no-data');
    
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    if (filteredKetuaData.length === 0) {
        if (noDataEl) noDataEl.style.display = 'block';
        return;
    }

    if (noDataEl) noDataEl.style.display = 'none';

    filteredKetuaData.forEach(ketua => {
        const card = document.createElement('div');
        card.className = 'dosen-card';
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            showKetuaDetail(ketua);
        });

        card.innerHTML = `
            <div class="card-icon">👥</div>
            <div class="card-content">
                <div class="card-title">${escapeHtml(ketua.nama)}</div>
                <div class="card-stats">
                    <div class="stat-item">
                        <span class="stat-label">NIM</span>
                        <span class="stat-value">${escapeHtml(ketua.nim)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">No WhatsApp</span>
                        <span class="stat-value">${escapeHtml(ketua.noWhatsApp || '-')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Jumlah Mata Kuliah</span>
                        <span class="stat-value">${ketua.matkulList.length}</span>
                    </div>
                </div>
            </div>
            <div class="card-arrow">→</div>
        `;

        cardsContainer.appendChild(card);
    });
}

// Show detail mata kuliah for selected ketua
function showKetuaDetail(ketua) {
    selectedKetua = ketua;
    const ketuaSection = document.getElementById('ketua-section');
    const detailMatkulSection = document.getElementById('detail-matkul-section');
    const ketuaNameHeader = document.getElementById('ketua-name-header');
    const ketuaInfoHeader = document.getElementById('ketua-info-header');
    const detailCardsContainer = document.getElementById('detail-matkul-cards');

    if (!detailMatkulSection || !detailCardsContainer) return;

    // Update header
    if (ketuaNameHeader) {
        ketuaNameHeader.textContent = ketua.nama;
    }
    if (ketuaInfoHeader) {
        ketuaInfoHeader.textContent = `NIM: ${ketua.nim} | No WhatsApp: ${ketua.noWhatsApp || '-'} | Total: ${ketua.matkulList.length} Mata Kuliah`;
    }

    // Render detail cards
    detailCardsContainer.innerHTML = '';

    if (ketua.matkulList.length === 0) {
        detailCardsContainer.innerHTML = '<div class="no-data">Tidak ada mata kuliah</div>';
    } else {
        ketua.matkulList.forEach(matkulKelas => {
            const card = document.createElement('div');
            card.className = 'matkul-card';

            card.innerHTML = `
                <div class="card-icon">📚</div>
                <div class="card-content">
                    <div class="card-title">${escapeHtml(matkulKelas)}</div>
                </div>
            `;

            detailCardsContainer.appendChild(card);
        });
    }

    // Show detail section, hide ketua section
    ketuaSection.style.display = 'none';
    detailMatkulSection.style.display = 'block';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

