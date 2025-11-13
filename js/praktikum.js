let praktikumData = {
    genap: [],
    ganjil: []
};
let groupedPraktikumData = {
    genap: [],
    ganjil: []
};
let currentSemester = 'ganjil';

// Load dan tampilkan data praktikum
document.addEventListener('DOMContentLoaded', async () => {
    // Suppress extension errors
    window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Receiving end does not exist')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    const loadingEl = document.getElementById('loading-praktikum');
    const errorEl = document.getElementById('error-praktikum');
    const praktikumContainer = document.getElementById('praktikum-container');
    const praktikumCards = document.getElementById('praktikum-cards');
    const noDataEl = document.getElementById('no-data-praktikum');
    const searchInput = document.getElementById('search-praktikum');

    // Validasi elemen
    if (!loadingEl || !errorEl || !praktikumContainer || !praktikumCards) {
        console.error('Error: Required elements not found');
        return;
    }

    try {
        // Load both CSV files
        console.log('Loading Evaluasi_RPS_MHS.csv (Genap)...');
        const allDataGenap = await loadCSV('Evaluasi_RPS_MHS.csv');
        
        console.log('Loading Evaluasi_RPS_MHS_ganjil25.csv (Ganjil)...');
        const allDataGanjil = await loadCSV('Evaluasi_RPS_MHS_ganjil25.csv');
        
        if (!allDataGenap || allDataGenap.length === 0) {
            throw new Error('Data CSV Semester Genap kosong atau tidak valid');
        }
        
        if (!allDataGanjil || allDataGanjil.length === 0) {
            console.warn('Data CSV Semester Ganjil kosong atau tidak valid');
        }

        // Filter data where Praktikum column = "Praktikum" for both semesters
        praktikumData.genap = allDataGenap.filter(row => {
            const praktikum = getColumnValue(row, 'Praktikum').toString().trim();
            return praktikum.toLowerCase() === 'praktikum';
        });
        
        praktikumData.ganjil = allDataGanjil.filter(row => {
            const praktikum = getColumnValue(row, 'Praktikum').toString().trim();
            return praktikum.toLowerCase() === 'praktikum';
        });

        console.log('Data loaded:', {
            genap: {
                total: allDataGenap.length,
                praktikum: praktikumData.genap.length
            },
            ganjil: {
                total: allDataGanjil.length,
                praktikum: praktikumData.ganjil.length
            }
        });

        // Debug: Log sample data
        if (praktikumData.genap.length > 0) {
            console.log('Sample praktikum data (Genap):', praktikumData.genap[0]);
        }
        if (praktikumData.ganjil.length > 0) {
            console.log('Sample praktikum data (Ganjil):', praktikumData.ganjil[0]);
        }

        // Process data for both semesters
        processPraktikumData('genap');
        processPraktikumData('ganjil');

        // Render cards for current semester
        renderPraktikumCards(groupedPraktikumData[currentSemester]);
        
        // Render average indicator
        renderAverageIndicator();

        // Hide loading, show container
        loadingEl.style.display = 'none';
        praktikumContainer.style.display = 'block';

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
                const filtered = groupedPraktikumData[currentSemester].filter(item => {
                    const matakuliah = (item.matakuliah || '').toLowerCase();
                    return matakuliah.includes(searchTerm);
                });
                renderPraktikumCards(filtered);
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
        console.error('Error loading praktikum data:', error);
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

// Process data: Group by Mata Kuliah and calculate statistics
function processPraktikumData(semester) {
    const groupedData = {};
    const data = praktikumData[semester] || [];
    
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
    
    // Convert to array and calculate statistics
    groupedPraktikumData[semester] = Object.values(groupedData).map(item => {
        const jumlahPertemuan = item.pertemuanSet.size;
        
        // Calculate Persentase Kehadiran Dosen = Jumlah Pertemuan / 14
        const persentaseKehadiranDosen = jumlahPertemuan > 0 
            ? ((jumlahPertemuan / 14) * 100).toFixed(1)
            : '0.0';
        
        // Calculate average attendance percentage (rata-rata mahasiswa yang hadir)
        let totalPercentage = 0;
        let meetingCount = 0;
        
        item.details.forEach(row => {
            const jumlahMahasiswa = parseInt(getColumnValue(row, 'Jumlah Mahasiswa')) || 0;
            const mahasiswaHadir = parseInt(getColumnValue(row, 'Mahasiswa Hadir')) || 0;
            
            if (jumlahMahasiswa > 0) {
                const percentage = (mahasiswaHadir / jumlahMahasiswa) * 100;
                totalPercentage += percentage;
                meetingCount++;
            }
        });
        
        // Calculate average percentage across all meetings
        const rataRataMahasiswaHadir = meetingCount > 0 
            ? (totalPercentage / meetingCount).toFixed(1)
            : '0.0';
        
        return {
            matakuliah: item.matakuliah,
            jumlahPertemuan: jumlahPertemuan,
            persentaseKehadiranDosen: parseFloat(persentaseKehadiranDosen),
            rataRataMahasiswaHadir: parseFloat(rataRataMahasiswaHadir),
            details: item.details.sort((a, b) => {
                // Sort by Pertemuan Ke
                const pertemuanA = parseInt(getColumnValue(a, 'Petemuan Ke')) || 0;
                const pertemuanB = parseInt(getColumnValue(b, 'Petemuan Ke')) || 0;
                return pertemuanA - pertemuanB;
            })
        };
    }).sort((a, b) => a.matakuliah.localeCompare(b.matakuliah));
    
    console.log(`Grouped praktikum data (${semester}):`, groupedPraktikumData[semester].length);
    if (groupedPraktikumData[semester].length > 0) {
        console.log(`Sample grouped data (${semester}):`, groupedPraktikumData[semester][0]);
    }
}

// Calculate and render average indicator
function renderAverageIndicator() {
    const averageIndicator = document.getElementById('average-indicator-praktikum');
    const avgKehadiranDosenBar = document.getElementById('avg-kehadiran-dosen-bar');
    const avgKehadiranDosenValue = document.getElementById('avg-kehadiran-dosen-value');
    const avgKehadiranMahasiswaBar = document.getElementById('avg-kehadiran-mahasiswa-bar');
    const avgKehadiranMahasiswaValue = document.getElementById('avg-kehadiran-mahasiswa-value');
    const averageIndicatorTitle = document.getElementById('average-indicator-title');
    
    const currentData = groupedPraktikumData[currentSemester] || [];
    
    if (!averageIndicator || currentData.length === 0) {
        if (averageIndicator) averageIndicator.style.display = 'none';
        return;
    }
    
    // Calculate average percentages
    let totalKehadiranDosen = 0;
    let totalKehadiranMahasiswa = 0;
    let count = 0;
    
    currentData.forEach(item => {
        totalKehadiranDosen += item.persentaseKehadiranDosen;
        totalKehadiranMahasiswa += item.rataRataMahasiswaHadir;
        count++;
    });
    
    const avgKehadiranDosen = count > 0 ? (totalKehadiranDosen / count).toFixed(1) : 0;
    const avgKehadiranMahasiswa = count > 0 ? (totalKehadiranMahasiswa / count).toFixed(1) : 0;
    
    // Update UI with animation
    if (avgKehadiranDosenBar && avgKehadiranDosenValue) {
        setTimeout(() => {
            avgKehadiranDosenBar.style.width = `${Math.min(parseFloat(avgKehadiranDosen), 100)}%`;
            avgKehadiranDosenValue.textContent = `${avgKehadiranDosen}%`;
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
        averageIndicatorTitle.textContent = `📊 Statistik Rata-Rata Praktikum - ${semesterName} (${count} Mata Kuliah)`;
    }
    
    // Show indicator
    averageIndicator.style.display = 'block';
}

// Render cards
function renderPraktikumCards(data) {
    const cardsGrid = document.getElementById('praktikum-cards');
    const noDataEl = document.getElementById('no-data-praktikum');
    
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
        card.className = 'absensi-card praktikum-card';
        
        // Add click event
        card.addEventListener('click', () => {
            showDetailView(item);
        });
        
        // Determine color for attendance percentage
        const attendanceColor = item.rataRataMahasiswaHadir >= 80 ? '#28a745' : 
                               item.rataRataMahasiswaHadir >= 60 ? '#f59e0b' : '#dc3545';
        
        // Determine color for dosen attendance
        const dosenColor = item.persentaseKehadiranDosen >= 80 ? '#28a745' : 
                          item.persentaseKehadiranDosen >= 60 ? '#f59e0b' : '#dc3545';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">🔬</div>
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
                        <span class="percentage-dot" style="background-color: ${dosenColor}"></span>
                        Persentase Kehadiran Dosen
                    </div>
                    <div class="percentage-bar-container">
                        <div class="percentage-bar" style="width: ${Math.min(item.persentaseKehadiranDosen, 100)}%; background-color: ${dosenColor}"></div>
                        <span class="percentage-value">${item.persentaseKehadiranDosen}%</span>
                    </div>
                    <div class="percentage-count">${item.jumlahPertemuan} dari 14 pertemuan</div>
                </div>
                <div class="percentage-item">
                    <div class="percentage-label">
                        <span class="percentage-dot" style="background-color: ${attendanceColor}"></span>
                        Rata-Rata Mahasiswa Hadir
                    </div>
                    <div class="percentage-bar-container">
                        <div class="percentage-bar" style="width: ${Math.min(item.rataRataMahasiswaHadir, 100)}%; background-color: ${attendanceColor}"></div>
                        <span class="percentage-value">${item.rataRataMahasiswaHadir}%</span>
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

// Show detail view
function showDetailView(item) {
    const container = document.getElementById('praktikum-container');
    const detailSection = document.getElementById('detail-praktikum-section');
    const breadcrumb = document.getElementById('breadcrumb-praktikum');
    const detailMatkulName = document.getElementById('detail-matkul-name');
    const detailMatkulInfo = document.getElementById('detail-matkul-info');
    const tableBody = document.getElementById('detail-praktikum-table-body');
    const averageIndicator = document.getElementById('average-indicator-praktikum');
    
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
    detailMatkulInfo.textContent = `Total ${item.jumlahPertemuan} pertemuan | Persentase Kehadiran Dosen: ${item.persentaseKehadiranDosen}% | Rata-Rata Mahasiswa Hadir: ${item.rataRataMahasiswaHadir}%`;
    
    // Render table
    tableBody.innerHTML = '';
    
    item.details.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        const namaDosen = getColumnValue(row, 'Pilih Nama Dosen').toString().trim();
        const pertemuan = getColumnValue(row, 'Petemuan Ke').toString().trim();
        const materi = getColumnValue(row, 'Materi yang diberikan').toString().trim();
        const jumlahMahasiswa = parseInt(getColumnValue(row, 'Jumlah Mahasiswa')) || 0;
        const mahasiswaHadir = parseInt(getColumnValue(row, 'Mahasiswa Hadir')) || 0;
        
        // Calculate percentage
        const percentage = jumlahMahasiswa > 0 
            ? ((mahasiswaHadir / jumlahMahasiswa) * 100).toFixed(1)
            : '0.0';
        
        // Determine color based on percentage
        const percentageNum = parseFloat(percentage);
        const percentageColor = percentageNum >= 80 ? '#28a745' : 
                               percentageNum >= 60 ? '#f59e0b' : '#dc3545';
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(namaDosen || '-')}</td>
            <td><strong>${escapeHtml(pertemuan || '-')}</strong></td>
            <td>${escapeHtml(materi || '-')}</td>
            <td>
                <span class="attendance-percentage" style="background-color: ${percentageColor === '#28a745' ? '#e8f5e9' : percentageColor === '#f59e0b' ? '#fff3cd' : '#f8d7da'}; color: ${percentageColor}">
                    ${percentage}%
                </span>
                <span class="attendance-detail">(${mahasiswaHadir}/${jumlahMahasiswa})</span>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// Show cards view
function showCardsView() {
    const container = document.getElementById('praktikum-container');
    const detailSection = document.getElementById('detail-praktikum-section');
    const breadcrumb = document.getElementById('breadcrumb-praktikum');
    const averageIndicator = document.getElementById('average-indicator-praktikum');
    
    if (container) container.style.display = 'block';
    if (detailSection) detailSection.style.display = 'none';
    if (breadcrumb) breadcrumb.style.display = 'none';
    if (averageIndicator) averageIndicator.style.display = 'block';
    
    // Re-render cards with current search
    const searchInput = document.getElementById('search-praktikum');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = groupedPraktikumData[currentSemester].filter(item => {
            const matakuliah = (item.matakuliah || '').toLowerCase();
            return matakuliah.includes(searchTerm);
        });
        renderPraktikumCards(filtered);
    } else {
        renderPraktikumCards(groupedPraktikumData[currentSemester]);
    }
    
    // Update average indicator
    renderAverageIndicator();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

