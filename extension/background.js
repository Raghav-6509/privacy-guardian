// Ensure background script is running
console.log('Background script loaded and running at:', new Date().toISOString());

// Keep service worker alive by setting up listeners immediately
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  // Collect data from currently open tabs
  collectCurrentTabsData();
});


// Function to collect data from currently open tabs
async function collectCurrentTabsData() {
  try {
    const tabs = await chrome.tabs.query({});
    console.log('Found', tabs.length, 'open tabs');
    
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        console.log('Collecting data from tab:', tab.url);
        monitorSite(tab);
      }
    }
  } catch (error) {
    console.error('Error collecting current tabs data:', error);
  }
}

// Monitor tab updates to collect visited sites data
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only monitor when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    console.log('Tab updated, monitoring site:', tab.url);
    monitorSite(tab);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'at:', new Date().toISOString());
  
  if (message.action === "test") {
    console.log('Test message received');
    const response = { success: true, message: "Background script is working!", timestamp: new Date().toISOString() };
    console.log('Sending test response:', response);
    sendResponse(response);
    return true; // Keep message channel open
  }
  
  if (message.action === "scanAllTabs") {
    scanAllTabs().then(sendResponse).catch(error => {
      console.error('Scan error:', error);
      sendResponse({ error: error.message });
    });
    return true; // keep the message channel open
  }
  
  if (message.action === "clearCookies") {
    clearAllCookies().then(sendResponse).catch(error => {
      console.error('Clear cookies error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (message.action === "blockTrackers") {
    toggleTrackerBlocking(message.enabled).then(sendResponse).catch(error => {
      console.error('Block trackers error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (message.action === "optimizeSettings") {
    optimizePrivacySettings().then(sendResponse).catch(error => {
      console.error('Optimize settings error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (message.action === "getVisitedSites") {
    console.log('Getting visited sites data:', visitedSitesData.length, 'sites');
    console.log('Visited sites data:', visitedSitesData);
    sendResponse({ success: true, sites: visitedSitesData });
    return false;
  }
  
  if (message.action === "collectCurrentTabs") {
    console.log('Manually collecting current tabs data...');
    collectCurrentTabsData().then(() => {
      sendResponse({ success: true, message: "Collected data from current tabs", sitesCount: visitedSitesData.length });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async operation
  }
  
  // Handle unknown actions
  sendResponse({ error: "Unknown action" });
  return false;
});

// Real-time monitoring and alerts
let isMonitoring = false;
let visitedSites = new Map();
let trackerBlockingEnabled = false;

// Store visited sites data
let visitedSitesData = [];

// Start real-time monitoring
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    await monitorSite(tab);
  }
});

// Monitor site for privacy risks
async function monitorSite(tab) {
  try {
    const domain = new URL(tab.url).hostname;
    const cookies = await new Promise((resolve) =>
      chrome.cookies.getAll({ domain: domain }, (cookies) => resolve(cookies.length))
    );
    
    // Mock tracker detection (in real implementation, analyze network requests)
    const trackers = Math.floor(Math.random() * 8) + 1;
    const riskScore = Math.max(0, 100 - (cookies * 0.1 + trackers * 8));
    
    // Store site data
    const siteData = {
      url: tab.url,
      title: tab.title,
      cookies: cookies,
      trackers: trackers,
      riskScore: riskScore,
      timestamp: Date.now()
    };
    
    visitedSites.set(domain, siteData);
    
    // Add to visited sites array for heatmap
    const existingSiteIndex = visitedSitesData.findIndex(site => site.domain === domain);
    if (existingSiteIndex >= 0) {
      // Update existing site
      visitedSitesData[existingSiteIndex] = {
        domain: domain,
        title: tab.title,
        riskScore: riskScore,
        cookies: cookies,
        trackers: trackers,
        visits: visitedSitesData[existingSiteIndex].visits + 1,
        lastVisit: new Date().toISOString()
      };
    } else {
      // Add new site
      visitedSitesData.push({
        domain: domain,
        title: tab.title,
        riskScore: riskScore,
        cookies: cookies,
        trackers: trackers,
        visits: 1,
        lastVisit: new Date().toISOString()
      });
    }
    
    // Keep only last 50 sites to avoid memory issues
    if (visitedSitesData.length > 50) {
      visitedSitesData = visitedSitesData.slice(-50);
    }
    
    // Alert for high-risk sites
    if (riskScore < 50) {
      showPrivacyAlert(tab, riskScore, cookies, trackers);
    }
    
    // Update badge
    updateBadge(riskScore);
    
  } catch (err) {
    console.error('Error monitoring site:', err);
  }
}

// Show privacy alert for high-risk sites
function showPrivacyAlert(tab, riskScore, cookies, trackers) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon.png',
    title: '🚨 High Privacy Risk Detected',
    message: `${tab.title} - Score: ${riskScore.toFixed(1)} (${cookies} cookies, ${trackers} trackers)`,
    buttons: [
      { title: 'Fix Now' },
      { title: 'View Details' }
    ]
  });
}

// Update extension badge with risk score
function updateBadge(riskScore) {
  const color = riskScore >= 70 ? '#22c55e' : riskScore >= 40 ? '#f59e0b' : '#ef4444';
  chrome.action.setBadgeText({ text: Math.round(riskScore).toString() });
  chrome.action.setBadgeBackgroundColor({ color: color });
}

// Clear all cookies
async function clearAllCookies() {
  try {
    console.log('Starting to clear cookies...');
    
    // Use chrome.browsingData.remove for more reliable cookie clearing
    await new Promise((resolve, reject) => {
      chrome.browsingData.remove({
        "since": 0 // Clear all cookies from beginning of time
      }, {
        "cookies": true
      }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
    
    console.log('Cookies cleared successfully');
    return { success: true, cleared: "all cookies" };
  } catch (err) {
    console.error('Error clearing cookies:', err);
    return { success: false, error: err.message };
  }
}

// Toggle tracker blocking
async function toggleTrackerBlocking(enabled) {
  try {
    console.log('Toggling tracker blocking:', enabled);
    trackerBlockingEnabled = enabled;
    
    if (enabled) {
      // Block common tracker domains
      chrome.webRequest.onBeforeRequest.addListener(
        blockTracker,
        { urls: ["<all_urls>"] },
        ["blocking"]
      );
      console.log('Tracker blocking enabled');
    } else {
      chrome.webRequest.onBeforeRequest.removeListener(blockTracker);
      console.log('Tracker blocking disabled');
    }
    
    return { success: true, enabled: trackerBlockingEnabled };
  } catch (err) {
    console.error('Error toggling tracker blocking:', err);
    return { success: false, error: err.message };
  }
}

// Block tracker requests
function blockTracker(details) {
  const trackerDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com/tr',
    'doubleclick.net',
    'amazon-adsystem.com',
    'adsystem.amazon.com'
  ];
  
  const url = new URL(details.url);
  if (trackerDomains.some(domain => url.hostname.includes(domain))) {
    return { cancel: true };
  }
}

// Optimize privacy settings
async function optimizePrivacySettings() {
  try {
    console.log('Starting privacy optimization...');
    const optimizations = [];
    
    // Clear browsing data (last hour) - more reliable approach
    await new Promise((resolve, reject) => {
      chrome.browsingData.remove({
        "since": Date.now() - (60 * 60 * 1000) // Last hour
      }, {
        "cache": true,
        "downloads": true,
        "fileSystems": true,
        "formData": true,
        "history": false, // Keep history
        "indexedDB": true,
        "localStorage": true,
        "passwords": false, // Keep passwords
        "serviceWorkers": true,
        "webSQL": true
      }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
    
    optimizations.push('Cleared temporary browsing data');
    
    // Enable tracker blocking
    if (!trackerBlockingEnabled) {
      await toggleTrackerBlocking(true);
      optimizations.push('Enabled tracker blocking');
    }
    
    // Clear cookies
    await new Promise((resolve, reject) => {
      chrome.browsingData.remove({
        "since": Date.now() - (7 * 24 * 60 * 60 * 1000) // Last week
      }, {
        "cookies": true
      }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
    
    optimizations.push('Cleared old cookies');
    
    console.log('Privacy optimization completed:', optimizations);
    return { success: true, optimizations: optimizations };
  } catch (err) {
    console.error('Error optimizing privacy settings:', err);
    return { success: false, error: err.message };
  }
}

async function scanAllTabs() {
  try {
    // Get current window and all its tabs
    const currentWindow = await chrome.windows.getCurrent({ populate: true });
    const tabs = currentWindow.tabs || [];
    
    const tabScans = [];
    let totalCookies = 0;
    let totalTrackers = 0;
    const allPermissions = new Set();

    // Scan each tab individually
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        try {
          // Get cookies for this specific domain
          const domain = new URL(tab.url).hostname;
          const tabCookies = await new Promise((resolve) =>
            chrome.cookies.getAll({ domain: domain }, (cookies) => resolve(cookies.length))
          );

          // Get permissions for this tab
          const tabPermissions = await new Promise((resolve) => {
            chrome.permissions.getAll((perms) => {
              const relevantPerms = (perms.permissions || []).filter(perm => 
                perm.includes('activeTab') || perm.includes('tabs') || perm.includes('cookies')
              );
              resolve(relevantPerms);
            });
          });

          // Mock trackers for this tab (in real implementation, this would analyze network requests)
          const tabTrackers = Math.floor(Math.random() * 5) + 1;

          // Calculate privacy score for this tab
          const tabScore = Math.max(0, 100 - (tabCookies * 0.1 + tabTrackers * 8 + tabPermissions.length * 3));

          const tabData = {
            id: tab.id,
            title: tab.title,
            url: tab.url,
            domain: domain,
            cookies: tabCookies,
            trackers: tabTrackers,
            permissions: tabPermissions,
            privacy_score: Math.round(tabScore * 100) / 100
          };

          tabScans.push(tabData);
          totalCookies += tabCookies;
          totalTrackers += tabTrackers;
          tabPermissions.forEach(perm => allPermissions.add(perm));

        } catch (err) {
          console.error(`Error scanning tab ${tab.id}:`, err);
        }
      }
    }

    // Calculate overall privacy score using average of individual tab scores
    // This provides a more balanced view when scanning multiple tabs
    const averageTabScore = tabScans.length > 0 
      ? tabScans.reduce((sum, tab) => sum + tab.privacy_score, 0) / tabScans.length 
      : 0;
    
    // Alternative: Use a more balanced overall calculation
    const overallScore = Math.max(0, 100 - (totalCookies * 0.02 + totalTrackers * 1.5 + allPermissions.size * 1));
    
    // Use the better of the two approaches
    const finalOverallScore = Math.max(averageTabScore, overallScore);
    
    // Debug logging
    console.log('Privacy Score Calculation:', {
      totalCookies,
      totalTrackers,
      totalPermissions: allPermissions.size,
      averageTabScore,
      overallScore,
      finalOverallScore,
      tabCount: tabScans.length
    });

    const scanData = {
      timestamp: new Date().toISOString(),
      overall: {
        total_cookies: totalCookies,
        total_trackers: totalTrackers,
        total_permissions: Array.from(allPermissions),
        privacy_score: Math.round(finalOverallScore * 100) / 100,
        tabs_scanned: tabScans.length
      },
      tabs: tabScans
    };

    // Send comprehensive data to backend
    try {
    const response = await fetch("http://127.0.0.1:5000/analyze_all_tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scanData)
    });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

    const result = await response.json();
    return result;
    } catch (fetchError) {
      console.error("Backend connection error:", fetchError);
      // Return local analysis without AI advice if backend is unavailable
      return {
        ...scanData,
        ai_advice: "Backend unavailable - showing local analysis only",
        ai_advice_list: ["Backend server is not running", "Please start the Flask backend server", "AI advice unavailable"]
      };
    }
  } catch (err) {
    console.error("Error scanning all tabs:", err);
    return { error: err.message };
  }
}
