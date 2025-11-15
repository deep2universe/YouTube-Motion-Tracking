// current url
var url = "---dummy---";

/**
 * Check if user switch to https://www.youtube.com/watch* url and init pose detection
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    if (details.url.includes("https://www.youtube.com/watch") && !details.url.includes(url)) {
        // if current differs from previous url
        url = details.url;
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            // Check if tabs exist and tab is valid
            if (!tabs || tabs.length === 0 || !tabs[0]) {
                console.log('YouTube Motion Tracking: No active tab found');
                return;
            }
            
            // Send message with proper error handling
            try {
                chrome.tabs.sendMessage(tabs[0].id, {message: "intPoseDetection"}, function (response) {
                    // Check for runtime errors (e.g., content script not ready)
                    if (chrome.runtime.lastError) {
                        // Silently handle - content script might not be ready yet
                        console.log('YouTube Motion Tracking: Content script not ready:', chrome.runtime.lastError.message);
                        return;
                    }
                });
            } catch (error) {
                console.log('YouTube Motion Tracking: Error sending message:', error);
            }
        });
    }
});

