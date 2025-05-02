  
  
  // Add this error handling at the start of your app.js
  if (!window.google) {
    console.error("Google API not loaded yet");
    // You might want to show a message to the user
  }

// Global variables
let spreadsheetId = '';
let gapiInited = false;
let gisInited = false;
let tokenClient;
let storedData = {};

// DOM elements
const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const loadDataButton = document.getElementById('loadDataButton');
const refreshDataButton = document.getElementById('refreshDataButton');
const clearDataButton = document.getElementById('clearDataButton');
const barcodeInput = document.getElementById('barcodeInput');
const scanResult = document.getElementById('scanResult');
const spreadsheetStatus = document.getElementById('spreadsheetStatus');
const dataStatus = document.getElementById('dataStatus');

// Sections
const authSection = document.getElementById('authSection');
const spreadsheetSection = document.getElementById('spreadsheetSection');
const scanSection = document.getElementById('scanSection');
const dataSection = document.getElementById('dataSection');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load stored spreadsheet ID if exists
    spreadsheetId = localStorage.getItem('spreadsheetId') || '';
    document.getElementById('spreadsheetId').value = spreadsheetId;
    
    // Load stored data if exists
    const storedDataString = localStorage.getItem('inventoryData');
    if (storedDataString) {
        storedData = JSON.parse(storedDataString);
        showSection(scanSection);
        showSection(dataSection);
        dataStatus.textContent = `Loaded ${Object.keys(storedData).length} items from local storage.`;
    }
    
    // Initialize Google API
    gapiLoaded();
    gisLoaded();
    
    // Event listeners
    signInButton.addEventListener('click', handleAuthClick);
    signOutButton.addEventListener('click', handleSignoutClick);
    loadDataButton.addEventListener('click', loadSpreadsheetData);
    refreshDataButton.addEventListener('click', loadSpreadsheetData);
    clearDataButton.addEventListener('click', clearLocalData);
    barcodeInput.addEventListener('input', handleBarcodeInput);
    barcodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleBarcodeInput(e);
        }
    });
});

// Google API initialization
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: '', // No API key needed
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '585467716936-2ekjjm1uqakjgjoqag18haqgee1m8f9j.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        signInButton.classList.remove('hidden');
    }
}

// Authentication functions
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        signInButton.classList.add('hidden');
        signOutButton.classList.remove('hidden');
        spreadsheetSection.classList.remove('hidden');
        loadSpreadsheetData();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: ''});
    } else {
        tokenClient.requestAccessToken({prompt: 'consent'});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        signInButton.classList.remove('hidden');
        signOutButton.classList.add('hidden');
        spreadsheetSection.classList.add('hidden');
        scanSection.classList.add('hidden');
        dataSection.classList.add('hidden');
    }
}

// Spreadsheet functions
async function loadSpreadsheetData() {
    spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    if (!spreadsheetId) {
        spreadsheetStatus.textContent = 'Please enter a spreadsheet ID';
        return;
    }
    
    // Save spreadsheet ID for future use
    localStorage.setItem('spreadsheetId', spreadsheetId);
    
    try {
        spreadsheetStatus.textContent = 'Loading data...';
        
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1', // Change if your sheet has a different name
        });
        
        const rows = response.result.values;
        if (rows.length === 0) {
            spreadsheetStatus.textContent = 'No data found.';
            return;
        }
        
        // Get headers (first row)
        const headers = rows[0];
        const skuIndex = headers.findIndex(header => header.toLowerCase() === 'sku');
        
        if (skuIndex === -1) {
            spreadsheetStatus.textContent = 'No "sku" column found in the first row.';
            return;
        }
        
        // Process rows (skip header)
        storedData = {};
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const sku = row[skuIndex];
            if (!sku) continue;
            
            const item = {};
            for (let j = 0; j < headers.length; j++) {
                if (j < row.length) {
                    item[headers[j]] = row[j];
                } else {
                    item[headers[j]] = '';
                }
            }
            storedData[sku] = item;
        }
        
        // Save to localStorage
        localStorage.setItem('inventoryData', JSON.stringify(storedData));
        
        spreadsheetStatus.textContent = `Successfully loaded ${Object.keys(storedData).length} items.`;
        dataStatus.textContent = `Loaded ${Object.keys(storedData).length} items from spreadsheet.`;
        
        showSection(scanSection);
        showSection(dataSection);
        
    } catch (err) {
        console.error('Error loading spreadsheet:', err);
        spreadsheetStatus.textContent = 'Error loading spreadsheet. Please check the ID and try again.';
    }
}

// Barcode scanning functions
function handleBarcodeInput(e) {
    const sku = e.target.value.trim();
    if (!sku) return;
    
    const item = storedData[sku];
    if (!item) {
        scanResult.innerHTML = `<p>Item with SKU "${sku}" not found.</p>`;
        return;
    }
    
    // Create editable table
    let html = '<h3>Item Details</h3>';
    html += '<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>';
    
    for (const [key, value] of Object.entries(item)) {
        html += `
            <tr>
                <td>${key}</td>
                <td>
                    <input type="text" 
                           class="edit-field" 
                           data-sku="${sku}" 
                           data-field="${key}" 
                           value="${value || ''}" 
                           onchange="updateLocalItem('${sku}', '${key}', this.value)">
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    scanResult.innerHTML = html;
    
    // Clear input after short delay
    setTimeout(() => {
        barcodeInput.value = '';
    }, 300);
}

// Update functions
function updateLocalItem(sku, field, value) {
    if (storedData[sku]) {
        storedData[sku][field] = value;
        localStorage.setItem('inventoryData', JSON.stringify(storedData));
    }
}

function clearLocalData() {
    localStorage.removeItem('inventoryData');
    storedData = {};
    dataStatus.textContent = 'Local data cleared.';
    scanResult.innerHTML = '';
    barcodeInput.value = '';
}

// Helper functions
function showSection(section) {
    section.classList.remove('hidden');
}



// Make function available globally
window.updateLocalItem = updateLocalItem;