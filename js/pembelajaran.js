let pembelajaranData = [];
let groupedPembelajaranData = [];

// Load dan tampilkan data pembelajaran
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    const loadingEl = document.getElementById('loading-pembelajaran');
    const errorEl = document.getElementById('error-pembelajaran');
    const pembelajaranContainer = document.getElementById('pembelajaran-container');
    const pembelajaranCards = document.getElementById('pembelajaran-cards');
    const noDataEl = document.getElementById('no-data-pembelajaran');
    const searchInput = document.getElementById('search-pembelajaran');

    // Validasi elemen
    if (!loadingEl || !errorEl || !pembelajaranContainer || !pembelajaranCards) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load CSV file
        console.log('Loading Evaluasi_RPS_MHS.csv...');
        pembelajaranData = await loadCSV('Evaluasi_RPS_MHS.csv');
        
        if (!pembelajaranData || pembelajaranData.length === 0) {
            throw new Error('Data pembelajaran CSV kosong atau tidak valid');
        }

        console.log('Data loaded:', {
            pembelajaran: pembelajaranData.length
        });

        // Debug: Log sample data
        if (pembelajaranData.length > 0) {
            console.log('Sample pembelajaran data:', pembelajaranData[0]);
            console.log('Pembelajaran keys:', Object.keys(pembelajaranData[0]));
        }

        // Process data: Group by Mata Kuliah
        processPembelajaranData();

        // Render cards
        renderPembelajaranCards(groupedPembelajaranData);

        // Hide loading, show container
        loadingEl.style.display = 'none';
        pembelajaranContainer.style.display = 'block';

        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = groupedPembelajaranData.filter(item => {
                    const matakuliah = (item.matakuliah || '').toLowerCase();
                    return matakuliah.includes(searchTerm);
                });
                renderPembelajaranCards(filtered);
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
        console.error('Error loading pembelajaran data:', error);
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

// Process data: Group by Mata Kuliah and count pertemuan
function processPembelajaranData() {
    const groupedData = {};
    
    pembelajaranData.forEach((row) => {
        // Get Mata Kuliah value
        const matakuliah = getColumnValue(row, 'Mata Kuliah').toString().trim();
        
        if (!matakuliah) return;
        
        if (!groupedData[matakuliah]) {
            groupedData[matakuliah] = {
                matakuliah: matakuliah,
                pertemuanSet: new Set(),
                details: []
            };
        }
        
        // Get Pertemuan Ke value (handle typo "Petemuan")
        const pertemuan = getColumnValue(row, 'Petemuan Ke').toString().trim();
        if (pertemuan) {
            groupedData[matakuliah].pertemuanSet.add(pertemuan);
        }
        
        // Store detail for later use
        groupedData[matakuliah].details.push(row);
    });
    
    // Convert to array and calculate jumlah pertemuan and average attendance
    groupedPembelajaranData = Object.values(groupedData).map(item => {
        // Calculate average attendance percentage (average of percentages per meeting)
        let totalPercentage = 0;
        let meetingCount = 0;
        let totalMahasiswa = 0;
        let totalHadir = 0;
        
        // Calculate RPS compliance percentage
        let sesuaiCount = 0;
        let totalKesesuaianCount = 0;
        
        item.details.forEach(row => {
            const jumlahMahasiswa = parseInt(getColumnValue(row, 'Jumlah Mahasiswa')) || 0;
            const mahasiswaHadir = parseInt(getColumnValue(row, 'Mahasiswa Hadir')) || 0;
            
            if (jumlahMahasiswa > 0) {
                const percentage = (mahasiswaHadir / jumlahMahasiswa) * 100;
                totalPercentage += percentage;
                meetingCount++;
            }
            
            totalMahasiswa += jumlahMahasiswa;
            totalHadir += mahasiswaHadir;
            
            // Count RPS compliance
            const kesesuaian = getColumnValue(row, 'Kesesuaian dengan RPS').toString().trim().toLowerCase();
            if (kesesuaian) {
                totalKesesuaianCount++;
                if (kesesuaian === 'sesuai') {
                    sesuaiCount++;
                }
            }
        });
        
        // Calculate average percentage across all meetings
        const averageAttendance = meetingCount > 0 
            ? (totalPercentage / meetingCount).toFixed(1)
            : '0.0';
        
        // Calculate RPS compliance percentage
        const rpsCompliancePercentage = totalKesesuaianCount > 0
            ? ((sesuaiCount / totalKesesuaianCount) * 100).toFixed(1)
            : '0.0';
        
        return {
            matakuliah: item.matakuliah,
            jumlahPertemuan: item.pertemuanSet.size,
            averageAttendance: parseFloat(averageAttendance),
            rpsCompliancePercentage: parseFloat(rpsCompliancePercentage),
            totalMahasiswa: totalMahasiswa,
            totalHadir: totalHadir,
            details: item.details.sort((a, b) => {
                // Sort by Pertemuan Ke
                const pertemuanA = parseInt(getColumnValue(a, 'Petemuan Ke')) || 0;
                const pertemuanB = parseInt(getColumnValue(b, 'Petemuan Ke')) || 0;
                return pertemuanA - pertemuanB;
            })
        };
    }).sort((a, b) => a.matakuliah.localeCompare(b.matakuliah));
    
    console.log('Grouped pembelajaran data:', groupedPembelajaranData.length);
    if (groupedPembelajaranData.length > 0) {
        console.log('Sample grouped data:', groupedPembelajaranData[0]);
    }
}

// Render cards
function renderPembelajaranCards(data) {
    const cardsGrid = document.getElementById('pembelajaran-cards');
    const noDataEl = document.getElementById('no-data-pembelajaran');
    
    if (!cardsGrid) {
        console.error('Cards grid element not found!');
        return;
    }
    
    cardsGrid.innerHTML = '';
    
    if (!data || data.length === 0) {
        cardsGrid.style.display = 'none';
        if (noDataEl) {
            noDataEl.style.display = 'block';
        }
        return;
    }
    
    cardsGrid.style.display = 'grid';
    if (noDataEl) {
        noDataEl.style.display = 'none';
    }
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'jadwal-card pembelajaran-card';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="jadwal-card-icon">📖</div>
            <div class="jadwal-card-content">
                <h3 class="jadwal-card-title">${escapeHtml(item.matakuliah)}</h3>
                <div class="jadwal-card-details">
                    <div class="jadwal-dosen-item">
                        <span class="jadwal-dosen-label">Jumlah Pertemuan:</span>
                        <span class="jadwal-dosen-value">${item.jumlahPertemuan}</span>
                    </div>
                    <div class="jadwal-dosen-item">
                        <span class="jadwal-dosen-label">Mahasiswa Hadir:</span>
                        <div class="attendance-info" style="margin-top: 5px;">
                            <span class="attendance-percentage">${item.averageAttendance}%</span>
                            <span class="attendance-detail">(${item.totalHadir}/${item.totalMahasiswa})</span>
                        </div>
                    </div>
                    <div class="jadwal-dosen-item">
                        <span class="jadwal-dosen-label">Kesesuaian dengan RPS:</span>
                        <div class="attendance-info" style="margin-top: 5px;">
                            <span class="attendance-percentage">${item.rpsCompliancePercentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            showDetailView(item);
        });
        
        cardsGrid.appendChild(card);
    });
}

// Show detail view
function showDetailView(item) {
    const container = document.getElementById('pembelajaran-container');
    const detailSection = document.getElementById('detail-pembelajaran-section');
    const breadcrumb = document.getElementById('breadcrumb-pembelajaran');
    const detailMatkulName = document.getElementById('detail-matkul-name');
    const detailMatkulInfo = document.getElementById('detail-matkul-info');
    const tableBody = document.getElementById('detail-pembelajaran-table-body');
    
    if (!container || !detailSection || !breadcrumb || !detailMatkulName || !tableBody) {
        console.error('Detail view elements not found!');
        return;
    }
    
    // Hide cards, show detail
    container.style.display = 'none';
    breadcrumb.style.display = 'block';
    detailSection.style.display = 'block';
    
    // Set header
    detailMatkulName.textContent = item.matakuliah;
    detailMatkulInfo.textContent = `Total ${item.jumlahPertemuan} pertemuan`;
    
    // Render table
    tableBody.innerHTML = '';
    
    item.details.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        const namaDosen = getColumnValue(row, 'Pilih Nama Dosen').toString().trim();
        const pertemuan = getColumnValue(row, 'Petemuan Ke').toString().trim();
        const materi = getColumnValue(row, 'Materi yang diberikan').toString().trim();
        const kesesuaian = getColumnValue(row, 'Kesesuaian dengan RPS').toString().trim();
        const jumlahMahasiswa = parseInt(getColumnValue(row, 'Jumlah Mahasiswa')) || 0;
        const mahasiswaHadir = parseInt(getColumnValue(row, 'Mahasiswa Hadir')) || 0;
        
        // Calculate percentage
        const percentage = jumlahMahasiswa > 0 
            ? ((mahasiswaHadir / jumlahMahasiswa) * 100).toFixed(1)
            : '0.0';
        
        // Create badge for Kesesuaian
        const kesesuaianClass = kesesuaian.toLowerCase() === 'sesuai' 
            ? 'badge-tepat-waktu' 
            : 'badge-tidak-tepat-waktu';
        const kesesuaianBadge = kesesuaian 
            ? `<span class="status-badge ${kesesuaianClass}">${escapeHtml(kesesuaian)}</span>`
            : '-';
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(namaDosen || '-')}</td>
            <td>${escapeHtml(pertemuan || '-')}</td>
            <td>${escapeHtml(materi || '-')}</td>
            <td>${kesesuaianBadge}</td>
            <td>
                <span class="attendance-percentage">${percentage}%</span>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// Show cards view
function showCardsView() {
    const container = document.getElementById('pembelajaran-container');
    const detailSection = document.getElementById('detail-pembelajaran-section');
    const breadcrumb = document.getElementById('breadcrumb-pembelajaran');
    
    if (container) container.style.display = 'block';
    if (detailSection) detailSection.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    
    // Re-render cards with current search
    const searchInput = document.getElementById('search-pembelajaran');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = groupedPembelajaranData.filter(item => {
            const matakuliah = (item.matakuliah || '').toLowerCase();
            return matakuliah.includes(searchTerm);
        });
        renderPembelajaranCards(filtered);
    } else {
        renderPembelajaranCards(groupedPembelajaranData);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

