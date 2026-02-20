let isMonitoring = false;
let checkInterval = null;
document.getElementById('startBtn').addEventListener('click', startMonitoring);
document.getElementById('stopBtn').addEventListener('click', stopMonitoring);
document.getElementById('clearLog').addEventListener('click', clearLog);

function startMonitoring() {
    isMonitoring = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    updateStatus('🟢 Monitoring...', '#27ae60');
    addLog('✅ Monitoring started');
    chrome.runtime.sendMessage({ action: 'start' });
    checkInterval = setInterval(checkAvailability, 5000);
    checkAvailability();
}

function stopMonitoring() {
    isMonitoring = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    updateStatus('🔴 Stopped', '#e74c3c');
    addLog('⏹️ Monitoring stopped');
    chrome.runtime.sendMessage({ action: 'stop' });
    if (checkInterval) clearInterval(checkInterval);
}

function checkAvailability() {
    fetch('https://appointment.thespainvisa.com')
        .then(response => response.text())
        .then(html => {
            const keywords = ['Book Now', 'Available Slots', 'available', 'book now'];
            const found = keywords.some(keyword => html.toLowerCase().includes(keyword.toLowerCase()));
            if (found) {
                notifyUser('🎉 Appointment Available!', 'Click to open the website');
                addLog('✨ AVAILABLE SLOTS FOUND!');
            } else {
                addLog('🔍 Checked - No slots available yet');
            }
            updateLastCheck();
        })
        .catch(error => addLog('❌ Error: ' + error.message));
}

function notifyUser(title, message) {
    if (document.getElementById('desktopNotification').checked) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><text x="50%" y="50%" font-size="80" fill="green">✓</text></svg>',
            title: title,
            message: message,
            priority: 2
        });
    }
    if (document.getElementById('soundNotification').checked) {
        playNotificationSound();
    }
    chrome.tabs.create({ url: 'https://appointment.thespainvisa.com' });
}

function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateStatus(status, color) {
    document.getElementById('status').textContent = status;
    document.getElementById('status').style.color = color;
}

function updateLastCheck() {
    document.getElementById('lastCheck').textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
}

function addLog(message) {
    const logList = document.getElementById('logList');
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    if (message.includes('✨') || message.includes('✅')) logItem.classList.add('success');
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logList.insertBefore(logItem, logList.firstChild);
    while (logList.children.length > 20) logList.removeChild(logList.lastChild);
}

function clearLog() {
    document.getElementById('logList').innerHTML = '';
    addLog('📋 Log cleared');
}

chrome.storage.local.get(['monitoring'], (result) => {
    if (result.monitoring) startMonitoring();
});