// Function to open dashboard in existing window or create new one
function openDashboard(event) {
  event.preventDefault();
  const dashboardUrl = "http://127.0.0.1:5000/dashboard";
  
  // Try to find existing dashboard tab
  chrome.tabs.query({url: dashboardUrl}, (tabs) => {
    if (tabs.length > 0) {
      // Update existing tab
      chrome.tabs.update(tabs[0].id, {url: dashboardUrl, active: true});
    } else {
      // Create new tab
      chrome.tabs.create({url: dashboardUrl});
    }
  });
}

// Test connection to background script
document.getElementById("testButton").addEventListener("click", () => {
  const btn = document.getElementById("testButton");
  const originalText = btn.textContent;
  
  btn.textContent = "Testing...";
  btn.disabled = true;
  
  console.log('Sending test message to background script...');
  
  // Use simpler approach without async/await
  chrome.runtime.sendMessage({ action: "test" }, (response) => {
    console.log('Test response received:', response);
    
    if (chrome.runtime.lastError) {
      console.error('Chrome runtime error:', chrome.runtime.lastError);
      btn.textContent = "❌ Failed";
      btn.style.background = "#ef4444";
    } else if (response && response.success) {
      btn.textContent = "✅ Working!";
      btn.style.background = "#22c55e";
    } else {
      btn.textContent = "❌ No Response";
      btn.style.background = "#ef4444";
    }
    
    // Reset button after 2 seconds
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "#6b7280";
      btn.disabled = false;
    }, 2000);
  });
});

document.getElementById("scanAllTabsButton").addEventListener("click", async () => {
  document.getElementById("scanAllTabsButton").innerText = "Scanning All Tabs...";
  document.getElementById("scanAllTabsButton").disabled = true;

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "scanAllTabs" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });

    if (!result || result.error) {
      throw new Error(result && result.error ? result.error : "Scan failed");
    }

    const overall = result.overall || {};
    const tabs = result.tabs || [];
    
    document.getElementById("totalTabs").textContent = tabs.length;
    document.getElementById("overallScore").textContent = overall.privacy_score || "--";
    document.getElementById("totalCookies").textContent = overall.total_cookies || 0;
    document.getElementById("totalTrackers").textContent = overall.total_trackers || 0;
    document.getElementById("totalPermissions").textContent = (overall.total_permissions || []).length;
    
    const adviceListEl = document.getElementById("overallAdviceList");
    adviceListEl.innerHTML = "";
    const tips = Array.isArray(result.ai_advice_list)
      ? result.ai_advice_list
      : (typeof result.ai_advice === 'string' ? result.ai_advice.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : []);
    tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      adviceListEl.appendChild(li);
    });

    document.getElementById("allTabsResults").classList.remove("hidden");
    document.getElementById("openAllTabsWeb").href = "http://127.0.0.1:5000/dashboard";
    document.getElementById("openAllTabsWeb").onclick = openDashboard;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    document.getElementById("scanAllTabsButton").innerText = "Scan All Tabs";
    document.getElementById("scanAllTabsButton").disabled = false;
  }
});

// Privacy Action Center Event Listeners
document.getElementById("clearCookiesBtn").addEventListener("click", async () => {
  const btn = document.getElementById("clearCookiesBtn");
  const status = document.getElementById("actionStatus");
  
  btn.disabled = true;
  btn.textContent = "Clearing...";
  status.textContent = "Clearing cookies...";
  status.className = "action-status loading";
  
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000); // 10 second timeout
      
      chrome.runtime.sendMessage({ action: "clearCookies" }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background script"));
          return;
        }
        resolve(response);
      });
    });
    
    if (result.success) {
      status.textContent = `✅ Cleared ${result.cleared} cookies`;
      status.className = "action-status success";
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    status.textContent = `❌ Error: ${err.message}`;
    status.className = "action-status error";
  } finally {
    btn.disabled = false;
    btn.textContent = "🧹 Clear Cookies";
  }
});

document.getElementById("blockTrackersBtn").addEventListener("click", async () => {
  const btn = document.getElementById("blockTrackersBtn");
  const status = document.getElementById("actionStatus");
  
  btn.disabled = true;
  btn.textContent = "Toggling...";
  status.textContent = "Updating tracker blocking...";
  status.className = "action-status loading";
  
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000);
      
      chrome.runtime.sendMessage({ action: "blockTrackers", enabled: true }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background script"));
          return;
        }
        resolve(response);
      });
    });
    
    if (result.success) {
      status.textContent = "✅ Tracker blocking enabled";
      status.className = "action-status success";
      btn.textContent = "🚫 Blocking Trackers";
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    status.textContent = `❌ Error: ${err.message}`;
    status.className = "action-status error";
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("optimizeBtn").addEventListener("click", async () => {
  const btn = document.getElementById("optimizeBtn");
  const status = document.getElementById("actionStatus");
  
  btn.disabled = true;
  btn.textContent = "Optimizing...";
  status.textContent = "Running privacy optimizations...";
  status.className = "action-status loading";
  
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000);
      
      chrome.runtime.sendMessage({ action: "optimizeSettings" }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background script"));
          return;
        }
        resolve(response);
      });
    });
    
    if (result.success) {
      const optimizations = result.optimizations.join(", ");
      status.textContent = `✅ Optimized: ${optimizations}`;
      status.className = "action-status success";
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    status.textContent = `❌ Error: ${err.message}`;
    status.className = "action-status error";
  } finally {
    btn.disabled = false;
    btn.textContent = "⚡ Optimize Settings";
  }
});
