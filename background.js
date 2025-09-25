// Google Meet Attendance Tracker Background Script
// This service worker handles extension lifecycle and background tasks

chrome.runtime.onInstalled.addListener(() => {
    console.log('Google Meet Attendance Tracker installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // The popup will handle this, but we can add additional logic here if needed
    console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for tab updates to detect Google Meet navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
        console.log('Google Meet page loaded:', tab.url);

        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            // Content script might already be injected, ignore error
            console.log('Content script injection result:', err.message);
        });
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    if (request.action === 'participantJoined') {
        // Could add notifications here in future versions
        console.log('New participant joined:', request.participant);
    }

    sendResponse({ success: true });
});
