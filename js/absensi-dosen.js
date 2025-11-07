let absensiData = [];
let filteredAbsensiData = [];

// Load dan tampilkan data absensi dosen
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    const loadingEl = document.getElementById('loading-absensi');
    const errorEl = document.getElementById('error-absensi');
    const absensiContainer = document.getElementById('absensi-container');
    const absensiCards = document.getElementById('absensi-cards');
    const noDataEl = document.getElementById('no-data-absensi');
    const searchInput = document.getElementById('search-absensi');

    // Validasi elemen
    if (!loadingEl || !errorEl || !absensiContainer || !absensiCards) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load CSV file
        console.log('Loading Absensi_Dosen_Ganjil2025.csv...');
        absensiData = await loadCSV('Absensi_Dosen_Ganjil2025.csv');
        
        if (!absensiData || absensiData.length === 0) {
            throw new Error('Data absensi CSV kosong atau tidak valid');
        }

        console.log('Data loaded:', {
            absensi: absensiData.length
        });

        // Debug: Log sample data
        if (absensiData.length > 0) {
            console.log('Sample absensi data:', absensiData[0]);
            console.log('Absensi keys:', Object.keys(absensiData[0]));
            
            // Check for Kesesuaian column variations
            const sampleRow = absensiData[0];
            const kesesuaianKeys = Object.keys(sampleRow).filter(key => 
                key.toLowerCase().includes('kesesuaian')
            );
            console.log('Kesesuaian column keys found:', kesesuaianKeys);
            
            // Find a sample row with "Akuntansi Keuangan Daerah - Kelas B"
            const sampleMatkul = absensiData.find(row => 
                (row['Matakuliah-Kelas'] || '').includes('Akuntansi Keuangan Daerah - Kelas B')
            );
            if (sampleMatkul) {
                console.log('Sample row for Akuntansi Keuangan Daerah - Kelas B:', sampleMatkul);
            }
        }

        // Process data
        processAbsensiData();

        // Render cards
        renderAbsensiCards();

        // Hide loading, show container
        loadingEl.style.display = 'none';
        absensiContainer.style.display = 'block';

        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                filterAbsensiData(searchTerm);
            });
        }

        // Setup back button
        const btnBackToCards = document.getElementById('btn-back-to-cards');
        if (btnBackToCards) {
            btnBackToCards.addEventListener('click', () => {
                showCardsView();
            });
        }

    } catch (error) {
        console.error('Error loading absensi data:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = `Error: ${error.message}`;
        errorEl.style.display = 'block';
    }
});

// Helper function to get column value by trying multiple key variations
function getColumnValue(row, columnName) {
    // Try exact match first
    if (row[columnName] !== undefined) {
        return row[columnName];
    }
    
    // Try with trailing space
    if (row[columnName + ' '] !== undefined) {
        return row[columnName + ' '];
    }
    
    // Try case-insensitive match
    const keys = Object.keys(row);
    const foundKey = keys.find(key => key.trim().toLowerCase() === columnName.toLowerCase());
    if (foundKey) {
        return row[foundKey];
    }
    
    return '';
}

// Process data: Group by Matakuliah-Kelas and calculate percentages
function processAbsensiData() {
    const groupedData = {};
    
    absensiData.forEach((row, index) => {
        // Get Matakuliah-Kelas value
        const matkulKelas = getColumnValue(row, 'Matakuliah-Kelas').toString().trim();
        
        if (!matkulKelas) return;
        
        if (!groupedData[matkulKelas]) {
            groupedData[matkulKelas] = {
                matkulKelas: matkulKelas,
                tepatWaktu: 0,
                tidakTepatWaktu: 0,
                total: 0
            };
        }
        
        // Get Kesesuaian value
        const kesesuaian = getColumnValue(row, 'Kesesuaian').toString().trim();
        groupedData[matkulKelas].total++;
        
        // Normalize the kesesuaian value for comparison
        const kesesuaianNormalized = kesesuaian.toLowerCase();
        
        if (kesesuaianNormalized === 'tepat waktu') {
            groupedData[matkulKelas].tepatWaktu++;
        } else if (kesesuaianNormalized === 'tidak tepat waktu') {
            groupedData[matkulKelas].tidakTepatWaktu++;
        } else if (kesesuaian) {
            // Debug: log unmatched values
            console.warn(`Unmatched Kesesuaian value: "${kesesuaian}" for ${matkulKelas} at row ${index + 1}`);
        }
    });
    
    // Convert to array and calculate percentages
    filteredAbsensiData = Object.values(groupedData).map(item => {
        const tepatWaktuPercent = item.total > 0 
            ? Math.round((item.tepatWaktu / item.total) * 100) 
            : 0;
        const tidakTepatWaktuPercent = item.total > 0 
            ? Math.round((item.tidakTepatWaktu / item.total) * 100) 
            : 0;
        
        return {
            ...item,
            tepatWaktuPercent,
            tidakTepatWaktuPercent
        };
    });
    
    // Sort by total pertemuan (descending), then by matkulKelas if same
    filteredAbsensiData.sort((a, b) => {
        if (b.total !== a.total) {
            return b.total - a.total; // Descending by total
        }
        return a.matkulKelas.localeCompare(b.matkulKelas); // Alphabetical if same total
    });
    
    console.log('Processed absensi data:', filteredAbsensiData.length, 'groups');
}

// Render cards
function renderAbsensiCards() {
    const absensiCards = document.getElementById('absensi-cards');
    const noDataEl = document.getElementById('no-data-absensi');
    
    if (!absensiCards) return;
    
    absensiCards.innerHTML = '';
    
    if (filteredAbsensiData.length === 0) {
        absensiCards.style.display = 'none';
        if (noDataEl) {
            noDataEl.style.display = 'block';
        }
        return;
    }
    
    absensiCards.style.display = 'grid';
    if (noDataEl) {
        noDataEl.style.display = 'none';
    }
    
    filteredAbsensiData.forEach(item => {
        const card = createAbsensiCard(item);
        absensiCards.appendChild(card);
    });
}

// Create card element
function createAbsensiCard(item) {
    const card = document.createElement('div');
    card.className = 'absensi-card';
    
    // Add click event listener
    card.addEventListener('click', () => {
        showDetailAbsensi(item.matkulKelas);
    });
    
    // Determine color based on percentage
    const tepatWaktuColor = '#28a745'; // Green
    const tidakTepatWaktuColor = '#dc3545'; // Red
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon">📚</div>
            <div class="card-content">
                <div class="card-title">${escapeHtml(item.matkulKelas)}</div>
            </div>
        </div>
        <div class="card-stats">
            <div class="stat-item">
                <div class="stat-label">Total Pertemuan</div>
                <div class="stat-value">${item.total}</div>
            </div>
        </div>
        <div class="percentage-indicators">
            <div class="percentage-item">
                <div class="percentage-label">
                    <span class="percentage-dot" style="background-color: ${tepatWaktuColor}"></span>
                    Tepat Waktu
                </div>
                <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${item.tepatWaktuPercent}%; background-color: ${tepatWaktuColor}"></div>
                    <span class="percentage-value">${item.tepatWaktuPercent}%</span>
                </div>
                <div class="percentage-count">${item.tepatWaktu} dari ${item.total} pertemuan</div>
            </div>
            <div class="percentage-item">
                <div class="percentage-label">
                    <span class="percentage-dot" style="background-color: ${tidakTepatWaktuColor}"></span>
                    Tidak Tepat Waktu
                </div>
                <div class="percentage-bar-container">
                    <div class="percentage-bar" style="width: ${item.tidakTepatWaktuPercent}%; background-color: ${tidakTepatWaktuColor}"></div>
                    <span class="percentage-value">${item.tidakTepatWaktuPercent}%</span>
                </div>
                <div class="percentage-count">${item.tidakTepatWaktu} dari ${item.total} pertemuan</div>
            </div>
        </div>
        <div style="margin-top: 15px; text-align: right; color: #667eea; font-size: 12px; font-weight: 600;">
            Klik untuk detail →
        </div>
    `;
    
    return card;
}

// Filter data based on search term
function filterAbsensiData(searchTerm) {
    if (!searchTerm) {
        filteredAbsensiData = Object.values(
            absensiData.reduce((acc, row) => {
                const matkulKelas = getColumnValue(row, 'Matakuliah-Kelas').toString().trim();
                if (!matkulKelas) return acc;
                
                if (!acc[matkulKelas]) {
                    acc[matkulKelas] = {
                        matkulKelas: matkulKelas,
                        tepatWaktu: 0,
                        tidakTepatWaktu: 0,
                        total: 0
                    };
                }
                
                const kesesuaian = getColumnValue(row, 'Kesesuaian').toString().trim();
                acc[matkulKelas].total++;
                
                const kesesuaianNormalized = kesesuaian.toLowerCase();
                if (kesesuaianNormalized === 'tepat waktu') {
                    acc[matkulKelas].tepatWaktu++;
                } else if (kesesuaianNormalized === 'tidak tepat waktu') {
                    acc[matkulKelas].tidakTepatWaktu++;
                }
                
                return acc;
            }, {})
        ).map(item => {
            const tepatWaktuPercent = item.total > 0 
                ? Math.round((item.tepatWaktu / item.total) * 100) 
                : 0;
            const tidakTepatWaktuPercent = item.total > 0 
                ? Math.round((item.tidakTepatWaktu / item.total) * 100) 
                : 0;
            
            return {
                ...item,
                tepatWaktuPercent,
                tidakTepatWaktuPercent
            };
        }).sort((a, b) => {
            if (b.total !== a.total) {
                return b.total - a.total; // Descending by total
            }
            return a.matkulKelas.localeCompare(b.matkulKelas); // Alphabetical if same total
        });
    } else {
        // Filter by search term
        const groupedData = {};
        
        absensiData.forEach(row => {
            const matkulKelas = getColumnValue(row, 'Matakuliah-Kelas').toString().trim();
            
            if (!matkulKelas || !matkulKelas.toLowerCase().includes(searchTerm)) {
                return;
            }
            
            if (!groupedData[matkulKelas]) {
                groupedData[matkulKelas] = {
                    matkulKelas: matkulKelas,
                    tepatWaktu: 0,
                    tidakTepatWaktu: 0,
                    total: 0
                };
            }
            
            const kesesuaian = getColumnValue(row, 'Kesesuaian').toString().trim();
            groupedData[matkulKelas].total++;
            
            const kesesuaianNormalized = kesesuaian.toLowerCase();
            if (kesesuaianNormalized === 'tepat waktu') {
                groupedData[matkulKelas].tepatWaktu++;
            } else if (kesesuaianNormalized === 'tidak tepat waktu') {
                groupedData[matkulKelas].tidakTepatWaktu++;
            }
        });
        
        filteredAbsensiData = Object.values(groupedData).map(item => {
            const tepatWaktuPercent = item.total > 0 
                ? Math.round((item.tepatWaktu / item.total) * 100) 
                : 0;
            const tidakTepatWaktuPercent = item.total > 0 
                ? Math.round((item.tidakTepatWaktu / item.total) * 100) 
                : 0;
            
            return {
                ...item,
                tepatWaktuPercent,
                tidakTepatWaktuPercent
            };
        }).sort((a, b) => {
            if (b.total !== a.total) {
                return b.total - a.total; // Descending by total
            }
            return a.matkulKelas.localeCompare(b.matkulKelas); // Alphabetical if same total
        });
    }
    
    renderAbsensiCards();
}

// Show detail absensi for selected mata kuliah
function showDetailAbsensi(matkulKelas) {
    const absensiContainer = document.getElementById('absensi-container');
    const detailSection = document.getElementById('detail-absensi-section');
    const breadcrumb = document.getElementById('breadcrumb-absensi');
    const detailMatkulName = document.getElementById('detail-matkul-name');
    const detailMatkulInfo = document.getElementById('detail-matkul-info');
    const detailTableBody = document.getElementById('detail-absensi-table-body');
    
    if (!detailSection || !detailTableBody) return;
    
    // Filter data untuk mata kuliah yang dipilih
    const detailData = absensiData.filter(row => {
        const rowMatkulKelas = getColumnValue(row, 'Matakuliah-Kelas').toString().trim();
        return rowMatkulKelas === matkulKelas;
    });
    
    // Sort by pertemuan
    detailData.sort((a, b) => {
        const pertemuanA = parseInt(getColumnValue(a, 'Pertemuan')) || 0;
        const pertemuanB = parseInt(getColumnValue(b, 'Pertemuan')) || 0;
        return pertemuanA - pertemuanB;
    });
    
    // Update header
    if (detailMatkulName) {
        detailMatkulName.textContent = matkulKelas;
    }
    
    // Calculate stats for info
    const totalPertemuan = detailData.length;
    const tepatWaktu = detailData.filter(row => {
        const kesesuaian = getColumnValue(row, 'Kesesuaian').toString().trim().toLowerCase();
        return kesesuaian === 'tepat waktu';
    }).length;
    const tidakTepatWaktu = totalPertemuan - tepatWaktu;
    
    if (detailMatkulInfo) {
        detailMatkulInfo.textContent = `Total: ${totalPertemuan} pertemuan | Tepat Waktu: ${tepatWaktu} | Tidak Tepat Waktu: ${tidakTepatWaktu}`;
    }
    
    // Render table
    detailTableBody.innerHTML = '';
    
    if (detailData.length === 0) {
        detailTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data absensi</td></tr>';
    } else {
        detailData.forEach((row, index) => {
            const no = index + 1;
            const namaDosen = getColumnValue(row, 'Nama Dosen').toString().trim();
            const pertemuan = getColumnValue(row, 'Pertemuan').toString().trim();
            const status = getColumnValue(row, 'Status').toString().trim();
            const tanggal = getColumnValue(row, 'Tanggal').toString().trim();
            const jam = getColumnValue(row, 'Jam').toString().trim();
            const kesesuaian = getColumnValue(row, 'Kesesuaian').toString().trim();
            
            // Determine badge color
            const kesesuaianLower = kesesuaian.toLowerCase();
            let badgeClass = '';
            let badgeColor = '';
            if (kesesuaianLower === 'tepat waktu') {
                badgeClass = 'badge-tepat-waktu';
                badgeColor = '#28a745';
            } else if (kesesuaianLower === 'tidak tepat waktu') {
                badgeClass = 'badge-tidak-tepat-waktu';
                badgeColor = '#dc3545';
            }
            
            const statusLower = status.toLowerCase();
            let statusBadgeClass = '';
            if (statusLower === 'online') {
                statusBadgeClass = 'badge-online';
            } else if (statusLower === 'offline') {
                statusBadgeClass = 'badge-offline';
            }
            
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = `
                <td>${no}</td>
                <td>${escapeHtml(namaDosen)}</td>
                <td><strong>${escapeHtml(pertemuan)}</strong></td>
                <td><span class="status-badge ${statusBadgeClass}">${escapeHtml(status)}</span></td>
                <td>${escapeHtml(tanggal)}</td>
                <td>${escapeHtml(jam)}</td>
                <td><span class="kesesuaian-badge ${badgeClass}" style="background-color: ${badgeColor}">${escapeHtml(kesesuaian)}</span></td>
            `;
            
            detailTableBody.appendChild(rowElement);
        });
    }
    
    // Show detail section, hide cards
    if (absensiContainer) absensiContainer.style.display = 'none';
    detailSection.style.display = 'block';
    if (breadcrumb) breadcrumb.style.display = 'block';
}

// Show cards view (back to list)
function showCardsView() {
    const absensiContainer = document.getElementById('absensi-container');
    const detailSection = document.getElementById('detail-absensi-section');
    const breadcrumb = document.getElementById('breadcrumb-absensi');
    
    if (detailSection) detailSection.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (absensiContainer) absensiContainer.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

