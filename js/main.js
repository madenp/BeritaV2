// Utility functions untuk parsing CSV
function parseCSV(csvText) {
    console.log('=== PARSE CSV: Starting ===');
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    console.log('=== PARSE CSV: Total lines:', lines.length);
    if (lines.length === 0) return [];
    
    // Parse header - JANGAN trim spasi di akhir karena beberapa header punya spasi
    const headerRow = parseCSVRow(lines[0]);
    console.log('=== PARSE CSV: Header row parsed:', headerRow);
    const headers = headerRow.map(h => {
        // Hapus quotes tapi pertahankan spasi di akhir
        let cleaned = h.replace(/^"|"$/g, '');
        // Pastikan spasi di akhir tetap ada
        return cleaned;
    });
    
    // Debug: Log headers untuk verifikasi
    console.log('=== PARSE CSV: Headers:', headers);
    if (headers.length >= 7) {
        console.log('=== PARSE CSV: Header 6 (Lama Perkualiahan):', JSON.stringify(headers[6]));
        console.log('=== PARSE CSV: Header 7 (Materi):', JSON.stringify(headers[7]));
    }
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (row.length === headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                // Trim value tapi pertahankan key dengan spasi
                obj[header] = (row[index] || '').trim();
            });
            data.push(obj);
        } else {
            // Debug row yang tidak match
            console.warn(`Row ${i} length mismatch: expected ${headers.length}, got ${row.length}`);
        }
    }
    
    // Debug: Log sample data
    if (data.length > 0) {
        console.log('=== PARSE CSV: Sample data keys:', Object.keys(data[0]));
        console.log('=== PARSE CSV: Sample data (first row):', data[0]);
        // Log specific keys
        const sample = data[0];
        Object.keys(sample).forEach(key => {
            console.log(`=== PARSE CSV: Key "${key}" =`, JSON.stringify(sample[key]));
        });
    }
    
    console.log('=== PARSE CSV: Completed, total rows:', data.length);
    return data;
}

// Parse CSV row dengan handling untuk quoted values
function parseCSVRow(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // End of field - JANGAN trim untuk header row (akan ditangani di parseCSV)
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add last field
    result.push(current);
    
    return result;
}

// Load CSV file
async function loadCSV(filename) {
    try {
        console.log('=== LOAD CSV: Starting load for', filename);
        
        // Cek apakah menggunakan file:// protocol
        if (window.location.protocol === 'file:') {
            throw new Error('Tidak dapat memuat file CSV menggunakan file:// protocol. Silakan gunakan web server lokal (lihat CARA-MENJALANKAN.md)');
        }

        console.log('=== LOAD CSV: Fetching file...');
        const response = await fetch(filename, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv,text/plain,*/*'
            },
            cache: 'no-cache'
        });

        console.log('=== LOAD CSV: Response status:', response.status);
        if (!response.ok) {
            throw new Error(`Gagal memuat ${filename}: ${response.status} ${response.statusText}`);
        }

        console.log('=== LOAD CSV: Reading text...');
        const csvText = await response.text();
        console.log('=== LOAD CSV: Text length:', csvText.length);
        
        if (!csvText || csvText.trim().length === 0) {
            throw new Error(`File ${filename} kosong atau tidak dapat dibaca`);
        }

        console.log('=== LOAD CSV: Parsing CSV...');
        const parsedData = parseCSV(csvText);
        console.log('=== LOAD CSV: Parsed rows:', parsedData.length);
        
        if (!parsedData || parsedData.length === 0) {
            throw new Error(`File ${filename} tidak berisi data yang valid`);
        }

        return parsedData;
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Gagal menghubungi server. Pastikan web server berjalan dan file ${filename} ada di folder yang sama.`);
        }
        console.error('=== LOAD CSV: Error loading CSV:', error);
        throw error;
    }
}

