const results = document.getElementById('results');

function addResult(message) {
    results.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
}

document.getElementById('testStorage').addEventListener('click', () => {
    addResult('Testing storage API...');
    chrome.storage.local.set({test: 'value'}, () => {
        if (chrome.runtime.lastError) {
            addResult('Storage ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addResult('Storage SUCCESS: Can write to storage');
        }
    });
});

document.getElementById('testTabs').addEventListener('click', () => {
    addResult('Testing tabs API...');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (chrome.runtime.lastError) {
            addResult('Tabs ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addResult('Tabs SUCCESS: Found ' + tabs.length + ' active tabs');
        }
    });
});

document.getElementById('testCookies').addEventListener('click', () => {
    addResult('Testing cookies API...');
    chrome.cookies.getAll({}, (cookies) => {
        if (chrome.runtime.lastError) {
            addResult('Cookies ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addResult('Cookies SUCCESS: Found ' + cookies.length + ' cookies');
        }
    });
});

document.getElementById('testBrowsingData').addEventListener('click', () => {
    addResult('Testing browsing data API...');
    chrome.browsingData.remove({
        "since": Date.now() - 1000 // Last second
    }, {
        "cache": true
    }, () => {
        if (chrome.runtime.lastError) {
            addResult('Browsing Data ERROR: ' + chrome.runtime.lastError.message);
        } else {
            addResult('Browsing Data SUCCESS: Can clear browsing data');
        }
    });
});
