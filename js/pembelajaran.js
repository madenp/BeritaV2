let pembelajaranData = {
    genap: [],
    ganjil: []
};
let groupedPembelajaranData = {
    genap: [],
    ganjil: []
};
let currentSemester = 'ganjil';

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
        // Load both CSV files
        console.log('Loading Evaluasi_RPS_MHS.csv (Genap)...');
        pembelajaranData.genap = await loadCSV('Evaluasi_RPS_MHS.csv');
        
        console.log('Loading Evaluasi_RPS_MHS_ganjil25.csv (Ganjil)...');
        pembelajaranData.ganjil = await loadCSV('Evaluasi_RPS_MHS_ganjil25.csv');
        
        if (!pembelajaranData.genap || pembelajaranData.genap.length === 0) {
            throw new Error('Data pembelajaran Semester Genap CSV kosong atau tidak valid');
        }
        
        if (!pembelajaranData.ganjil || pembelajaranData.ganjil.length === 0) {
            console.warn('Data pembelajaran Semester Ganjil CSV kosong atau tidak valid');
        }

        console.log('Data loaded:', {
            genap: pembelajaranData.genap.length,
            ganjil: pembelajaranData.ganjil.length
        });

        // Debug: Log sample data
        if (pembelajaranData.genap.length > 0) {
            console.log('Sample pembelajaran data (Genap):', pembelajaranData.genap[0]);
        }
        if (pembelajaranData.ganjil.length > 0) {
            console.log('Sample pembelajaran data (Ganjil):', pembelajaranData.ganjil[0]);
        }

        // Process data for both semesters
        processPembelajaranData('genap');
        processPembelajaranData('ganjil');

        // Render cards for current semester
        renderPembelajaranCards(groupedPembelajaranData[currentSemester]);

        // Render average indicator
        renderAverageIndicator();

        // Hide loading, show container
        loadingEl.style.display = 'none';
        pembelajaranContainer.style.display = 'block';

        // Setup semester selector
        const semesterSelect = document.getElementById('semester-select');
        if (semesterSelect) {
            semesterSelect.addEventListener('change', (e) => {
                currentSemester = e.target.value;
                // Clear search when switching semester
                if (searchInput) {
                    searchInput.value = '';
                }
                // Show cards view
                showCardsView();
                // Update average indicator
                renderAverageIndicator();
            });
        }

        // Setup search
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = groupedPembelajaranData[currentSemester].filter(item => {
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
function processPembelajaranData(semester) {
    const groupedData = {};
    const data = pembelajaranData[semester] || [];
    
    data.forEach((row) => {
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
    groupedPembelajaranData[semester] = Object.values(groupedData).map(item => {
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
    
    console.log(`Grouped pembelajaran data (${semester}):`, groupedPembelajaranData[semester].length);
    if (groupedPembelajaranData[semester].length > 0) {
        console.log(`Sample grouped data (${semester}):`, groupedPembelajaranData[semester][0]);
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
        card.className = 'absensi-card pembelajaran-card';
        
        // Add click event
        card.addEventListener('click', () => {
            showDetailView(item);
        });
        
        // Determine color for attendance percentage
        const attendanceColor = item.averageAttendance >= 80 ? '#28a745' : 
                               item.averageAttendance >= 60 ? '#f59e0b' : '#dc3545';
        
        // Determine color for RPS compliance
        const rpsColor = item.rpsCompliancePercentage >= 80 ? '#28a745' : 
                        item.rpsCompliancePercentage >= 60 ? '#f59e0b' : '#dc3545';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">📖</div>
                <div class="card-content">
                    <div class="card-title">${escapeHtml(item.matakuliah)}</div>
                </div>
            </div>
            <div class="card-stats">
                <div class="stat-item">
                    <div class="stat-label">Jumlah Pertemuan</div>
                    <div class="stat-value">${item.jumlahPertemuan}</div>
                </div>
            </div>
            <div class="percentage-indicators">
                <div class="percentage-item">
                    <div class="percentage-label">
                        <span class="percentage-dot" style="background-color: ${attendanceColor}"></span>
                        Rata-Rata Mahasiswa Hadir
                    </div>
                    <div class="percentage-bar-container">
                        <div class="percentage-bar" style="width: ${Math.min(item.averageAttendance, 100)}%; background-color: ${attendanceColor}"></div>
                        <span class="percentage-value">${item.averageAttendance}%</span>
                    </div>
                </div>
                <div class="percentage-item">
                    <div class="percentage-label">
                        <span class="percentage-dot" style="background-color: ${rpsColor}"></span>
                        Kesesuaian dengan RPS
                    </div>
                    <div class="percentage-bar-container">
                        <div class="percentage-bar" style="width: ${Math.min(item.rpsCompliancePercentage, 100)}%; background-color: ${rpsColor}"></div>
                        <span class="percentage-value">${item.rpsCompliancePercentage}%</span>
                    </div>
                </div>
            </div>
            <div style="margin-top: 15px; text-align: right; color: #667eea; font-size: 12px; font-weight: 600;">
                Klik untuk detail →
            </div>
        `;
        
        cardsGrid.appendChild(card);
    });
}

// Calculate and render average indicator
function renderAverageIndicator() {
    const averageIndicator = document.getElementById('average-indicator-pembelajaran');
    const avgRpsComplianceBar = document.getElementById('avg-rps-compliance-bar');
    const avgRpsComplianceValue = document.getElementById('avg-rps-compliance-value');
    const avgKehadiranMahasiswaBar = document.getElementById('avg-kehadiran-mahasiswa-bar');
    const avgKehadiranMahasiswaValue = document.getElementById('avg-kehadiran-mahasiswa-value');
    const averageIndicatorTitle = document.getElementById('average-indicator-title');
    
    const currentData = groupedPembelajaranData[currentSemester] || [];
    
    if (!averageIndicator || currentData.length === 0) {
        if (averageIndicator) averageIndicator.style.display = 'none';
        return;
    }
    
    // Calculate average percentages
    let totalKehadiranMahasiswa = 0;
    let totalRpsCompliance = 0;
    let count = 0;
    
    currentData.forEach(item => {
        totalKehadiranMahasiswa += item.averageAttendance;
        totalRpsCompliance += item.rpsCompliancePercentage;
        count++;
    });
    
    const avgKehadiranMahasiswa = count > 0 ? (totalKehadiranMahasiswa / count).toFixed(1) : 0;
    const avgRpsCompliance = count > 0 ? (totalRpsCompliance / count).toFixed(1) : 0;
    
    // Update UI with animation
    if (avgRpsComplianceBar && avgRpsComplianceValue) {
        setTimeout(() => {
            avgRpsComplianceBar.style.width = `${Math.min(parseFloat(avgRpsCompliance), 100)}%`;
            avgRpsComplianceValue.textContent = `${avgRpsCompliance}%`;
        }, 100);
    }
    
    if (avgKehadiranMahasiswaBar && avgKehadiranMahasiswaValue) {
        setTimeout(() => {
            avgKehadiranMahasiswaBar.style.width = `${Math.min(parseFloat(avgKehadiranMahasiswa), 100)}%`;
            avgKehadiranMahasiswaValue.textContent = `${avgKehadiranMahasiswa}%`;
        }, 150);
    }
    
    // Update header with semester and total count
    const semesterName = currentSemester === 'genap' ? 'Semester Genap 2024/2025' : 'Semester Ganjil 2025/2026';
    if (averageIndicatorTitle && count > 0) {
        averageIndicatorTitle.textContent = `📊 Statistik Rata-Rata Pembelajaran - ${semesterName} (${count} Mata Kuliah)`;
    }
    
    // Show indicator
    averageIndicator.style.display = 'block';
}

// Show detail view
function showDetailView(item) {
    const container = document.getElementById('pembelajaran-container');
    const detailSection = document.getElementById('detail-pembelajaran-section');
    const breadcrumb = document.getElementById('breadcrumb-pembelajaran');
    const detailMatkulName = document.getElementById('detail-matkul-name');
    const detailMatkulInfo = document.getElementById('detail-matkul-info');
    const tableBody = document.getElementById('detail-pembelajaran-table-body');
    const averageIndicator = document.getElementById('average-indicator-pembelajaran');
    
    if (!container || !detailSection || !breadcrumb || !detailMatkulName || !tableBody) {
        console.error('Detail view elements not found!');
        return;
    }
    
    // Hide cards and average indicator, show detail
    container.style.display = 'none';
    if (averageIndicator) averageIndicator.style.display = 'none';
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
    const averageIndicator = document.getElementById('average-indicator-pembelajaran');
    
    if (container) container.style.display = 'block';
    if (detailSection) detailSection.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (averageIndicator) averageIndicator.style.display = 'block';
    
    // Re-render cards with current search
    const searchInput = document.getElementById('search-pembelajaran');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = groupedPembelajaranData[currentSemester].filter(item => {
            const matakuliah = (item.matakuliah || '').toLowerCase();
            return matakuliah.includes(searchTerm);
        });
        renderPembelajaranCards(filtered);
    } else {
        renderPembelajaranCards(groupedPembelajaranData[currentSemester]);
    }
    
    // Update average indicator
    renderAverageIndicator();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

