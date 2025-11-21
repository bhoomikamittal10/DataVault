// Initialize dashboard on load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
    loadStoredSessions();
    loadActivityLog();
});

// Check if user is authenticated
function checkAuth() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    const user = JSON.parse(userData);
    document.getElementById('userName').textContent = `Welcome, ${user.name.split(' ')[0]}`;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    }
}

// Load dashboard data from localStorage
function loadDashboardData() {
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || {
        totalDataStored: 0,
        lastWifiCaptured: 'Not Connected',
        availableOffline: 0,
        encryptionStatus: 'Active'
    };

    document.getElementById('totalDataStored').textContent = dashboardData.totalDataStored + ' MB';
    document.getElementById('lastWifiCaptured').textContent = dashboardData.lastWifiCaptured;
    document.getElementById('availableOffline').textContent = dashboardData.availableOffline + ' MB';
    document.getElementById('encryptionStatus').textContent = dashboardData.encryptionStatus;
}

// Simulate Wi-Fi scanning
function connectWiFi() {
    const btn = document.getElementById('connectWifiBtn');
    const wifiNetworks = document.getElementById('wifiNetworks');
    const wifiStatus = document.getElementById('wifiStatus');
    
    btn.textContent = '🔍 Scanning...';
    btn.disabled = true;

    addActivity('🔍 Scanning for Wi-Fi networks...');

    setTimeout(() => {
        // Simulate found networks
        const networks = [
            { name: 'Home WiFi 5G', signal: '📶📶📶' },
            { name: 'Office Network', signal: '📶📶📶📶' },
            { name: 'Guest WiFi', signal: '📶📶' }
        ];

        wifiNetworks.innerHTML = networks.map(network => `
            <div class="wifi-network" onclick="selectWiFi('${network.name}')">
                <span>${network.name}</span>
                <span class="signal-strength">${network.signal}</span>
            </div>
        `).join('');

        btn.textContent = '✓ Networks Found';
        addActivity('✓ Found ' + networks.length + ' Wi-Fi networks');
    }, 2000);
}

// Select Wi-Fi network
function selectWiFi(networkName) {
    const wifiStatus = document.getElementById('wifiStatus');
    const storeSessionBtn = document.getElementById('storeSessionBtn');
    
    wifiStatus.innerHTML = `
        <span class="status-indicator online"></span>
        <span>Connected to ${networkName}</span>
    `;

    // Update dashboard data
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || {};
    dashboardData.lastWifiCaptured = networkName;
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    document.getElementById('lastWifiCaptured').textContent = networkName;

    // Enable store session button
    storeSessionBtn.disabled = false;

    addActivity(`✓ Connected to ${networkName}`, 'success');
}

// Store session with encryption
function storeSession() {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const encryptionMessage = document.getElementById('encryptionMessage');
    const storeSessionBtn = document.getElementById('storeSessionBtn');

    storeSessionBtn.disabled = true;
    progressContainer.style.display = 'block';

    addActivity('📦 Starting data capture session...');

    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = progress + '%';
        progressText.textContent = progress + '%';

        // Show encryption messages at different stages
        if (progress === 20) {
            encryptionMessage.textContent = '🔐 Initializing encryption...';
            encryptionMessage.style.color = 'var(--warning)';
        } else if (progress === 40) {
            encryptionMessage.textContent = '🔒 Encrypting data packets with AES-256...';
            encryptionMessage.style.color = 'var(--primary)';
        } else if (progress === 60) {
            encryptionMessage.textContent = '💾 Compressing encrypted data...';
        } else if (progress === 80) {
            encryptionMessage.textContent = '✓ Storing securely in local vault...';
            encryptionMessage.style.color = 'var(--success)';
        }

        if (progress >= 100) {
            clearInterval(interval);
            
            // Simulate data encryption using CryptoJS
            const sessionData = {
                timestamp: new Date().toISOString(),
                networkName: document.getElementById('lastWifiCaptured').textContent,
                dataSize: Math.floor(Math.random() * 50) + 100, // Random size between 100-150 MB
                packets: Math.floor(Math.random() * 10000) + 5000
            };

            // Encrypt the session data
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(sessionData), 
                'DataVaultSecretKey2025'
            ).toString();

            // Store encrypted session
            const sessions = JSON.parse(localStorage.getItem('storedSessions')) || [];
            sessions.push({
                id: Date.now(),
                encrypted: encryptedData,
                size: sessionData.dataSize,
                timestamp: sessionData.timestamp,
                network: sessionData.networkName
            });
            localStorage.setItem('storedSessions', JSON.stringify(sessions));

            // Update dashboard stats
            const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || {};
            dashboardData.totalDataStored = (dashboardData.totalDataStored || 0) + sessionData.dataSize;
            dashboardData.availableOffline = dashboardData.totalDataStored;
            localStorage.setItem('dashboardData', JSON.stringify(dashboardData));

            encryptionMessage.textContent = '✓ Session stored successfully with bank-grade encryption!';
            encryptionMessage.style.color = 'var(--success)';

            addActivity(`✓ Stored ${sessionData.dataSize} MB of encrypted data`, 'success');

            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressFill.style.width = '0%';
                storeSessionBtn.disabled = false;
                loadDashboardData();
                loadStoredSessions();
            }, 2000);
        }
    }, 50);
}

// Load stored sessions
function loadStoredSessions() {
    const sessions = JSON.parse(localStorage.getItem('storedSessions')) || [];
    const container = document.getElementById('storedSessions');

    if (sessions.length === 0) {
        container.innerHTML = '<p style="color: var(--gray); text-align: center;">No stored sessions yet. Connect to Wi-Fi and store a session!</p>';
        return;
    }

    container.innerHTML = sessions.map(session => `
        <div class="session-item">
            <div class="session-icon">🔐</div>
            <div class="session-info">
                <h4>${session.network}</h4>
                <p>${new Date(session.timestamp).toLocaleString()}</p>
            </div>
            <div class="session-size">${session.size} MB</div>
        </div>
    `).join('');
}

// Access offline data
function accessOffline() {
    const sessions = JSON.parse(localStorage.getItem('storedSessions')) || [];
    
    if (sessions.length === 0) {
        alert('No offline data available. Please store a session first!');
        return;
    }

    addActivity('🌐 Accessing offline data...');

    setTimeout(() => {
        // Decrypt and show the data
        const latestSession = sessions[sessions.length - 1];
        const decryptedData = CryptoJS.AES.decrypt(latestSession.encrypted, 'DataVaultSecretKey2025');
        const sessionData = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));

        alert(`✓ Offline Access Successful!\n\nNetwork: ${sessionData.networkName}\nData Available: ${sessionData.dataSize} MB\nPackets: ${sessionData.packets.toLocaleString()}\nCaptured: ${new Date(sessionData.timestamp).toLocaleString()}`);

        addActivity(`✓ Accessed ${sessionData.dataSize} MB of offline data`, 'success');
    }, 1000);
}

// Delete cache
function deleteCache() {
    if (confirm('Are you sure you want to delete all cached data? This action cannot be undone.')) {
        localStorage.removeItem('storedSessions');
        const dashboardData = JSON.parse(localStorage.getItem('dashboardData')) || {};
        dashboardData.totalDataStored = 0;
        dashboardData.availableOffline = 0;
        localStorage.setItem('dashboardData', JSON.stringify(dashboardData));

        loadDashboardData();
        loadStoredSessions();
        addActivity('🗑️ All cached data deleted', 'warning');
    }
}

// Sync again
function syncAgain() {
    const lastWifi = document.getElementById('lastWifiCaptured').textContent;
    
    if (lastWifi === 'Not Connected') {
        alert('Please connect to Wi-Fi first!');
        return;
    }

    addActivity('🔄 Re-syncing with ' + lastWifi + '...');

    setTimeout(() => {
        alert('✓ Sync completed successfully!');
        addActivity('✓ Sync completed with ' + lastWifi, 'success');
    }, 2000);
}

// Add activity to log
function addActivity(text, type = 'info') {
    const activityLog = document.getElementById('activityLog');
    const icons = {
        info: 'ℹ️',
        success: '✓',
        warning: '⚠️',
        error: '❌'
    };

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <span class="activity-icon">${icons[type]}</span>
        <span class="activity-text">${text}</span>
        <span class="activity-time">${new Date().toLocaleTimeString()}</span>
    `;

    activityLog.insertBefore(activityItem, activityLog.firstChild);

    // Store in localStorage
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    activities.unshift({
        text,
        type,
        time: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities.slice(0, 20))); // Keep last 20
}

// Load activity log
function loadActivityLog() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const activityLog = document.getElementById('activityLog');

    if (activities.length > 1) {
        const icons = {
            info: 'ℹ️',
            success: '✓',
            warning: '⚠️',
            error: '❌'
        };

        activityLog.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${icons[activity.type]}</span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${new Date(activity.time).toLocaleTimeString()}</span>
            </div>
        `).join('');
    }
}
