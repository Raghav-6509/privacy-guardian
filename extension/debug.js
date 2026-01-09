const log = document.getElementById('log');

function addLog(message) {
    log.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
}

document.getElementById('testBtn').addEventListener('click', () => {
    addLog('Testing background script...');
    addLog('Extension ID: ' + chrome.runtime.id);
    addLog('Extension URL: ' + chrome.runtime.getURL(''));
    
    chrome.runtime.sendMessage({ action: "test" }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
            addLog('Error details: ' + JSON.stringify(chrome.runtime.lastError));
        } else if (response) {
            addLog('SUCCESS: ' + JSON.stringify(response));
        } else {
            addLog('NO RESPONSE: Background script may not be running');
        }
    });
    
    // Also try to check if background script is accessible
    setTimeout(() => {
        addLog('Checking background script status...');
        chrome.runtime.getBackgroundPage((backgroundPage) => {
            if (backgroundPage) {
                addLog('Background page is accessible');
            } else {
                addLog('Background page is NOT accessible');
            }
        });
    }, 1000);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    addLog('Clearing cookies...');
    chrome.runtime.sendMessage({ action: "clearCookies" }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addLog('SUCCESS: ' + JSON.stringify(response));
        }
    });
});

document.getElementById('blockBtn').addEventListener('click', () => {
    addLog('Blocking trackers...');
    chrome.runtime.sendMessage({ action: "blockTrackers", enabled: true }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addLog('SUCCESS: ' + JSON.stringify(response));
        }
    });
});

document.getElementById('optimizeBtn').addEventListener('click', () => {
    addLog('Optimizing settings...');
    chrome.runtime.sendMessage({ action: "optimizeSettings" }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addLog('SUCCESS: ' + JSON.stringify(response));
        }
    });
});

document.getElementById('getSitesBtn').addEventListener('click', () => {
    addLog('Getting visited sites...');
    chrome.runtime.sendMessage({ action: "getVisitedSites" }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addLog('SUCCESS: Found ' + (response.sites ? response.sites.length : 0) + ' sites');
            if (response.sites && response.sites.length > 0) {
                response.sites.forEach(site => {
                    addLog('Site: ' + site.domain + ' - Score: ' + site.riskScore + ' - Visits: ' + site.visits);
                });
            } else {
                addLog('No sites found. Try browsing some websites first.');
            }
        }
    });
});

document.getElementById('collectTabsBtn').addEventListener('click', () => {
    addLog('Collecting data from current tabs...');
    chrome.runtime.sendMessage({ action: "collectCurrentTabs" }, (response) => {
        if (chrome.runtime.lastError) {
            addLog('ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addLog('SUCCESS: ' + JSON.stringify(response));
        }
    });
});
