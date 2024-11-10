// Set switchStatus to true when user switches to a tab that isn’t the monitored URL.
// Keep switchStatus as true when user switched between different non-monitored tabs.
// Reset switchStatus to false when the user switches back to the monitored URL tab.

let monitoredUrl = null;
let isSwitchedTab = false;
let previousTabUrl = null;

// 1.Set the monitored URL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setUrl") {
    monitoredUrl = request.url;
    isSwitchedTab = false;
    console.log(`Monitoring URL: ${monitoredUrl}`);
    sendResponse({ success: true });
  } else if (request.action === "getSwitchStatus") {
    sendResponse({ isSwitchedTab });
  }
});

// 2.Listen for tab switch events
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab) {
      isSwitchedTab = tab.url !== monitoredUrl;
      console.log(`Switched to Tab URL: ${tab.url}`);
      console.log("Is Switched Tab:", isSwitchedTab);
    }
  });
});

// 3. function to handle tab switching
function handleTabSwitch(tabUrl) {
  if (tabUrl == monitoredUrl) {
    isSwitchedTab = false;
    previousTabUrl = monitoredUrl; 
    console.log("User returned to monitored URL. switchStatus = false");
  } else {
    if (previousTabUrl === monitoredUrl) {
      isSwitchedTab = true;
      console.log("User switched to a non-monitored tab once. switchStatus = true");
    } else if (tabUrl && previousTabUrl !== monitoredUrl) {
      isSwitchedTab = true;
      console.log("User switched between non-monitored tabs. switchStatus = true");
    }
    previousTabUrl = tabUrl; 
  }
}


// Listen for tab activation (switch) events
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab) {
      handleTabSwitch(tab.url);
    }
  });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    handleTabSwitch(tab.url);
  }
});
