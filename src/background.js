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
            chrome.tabs.sendMessage(tabs[0].id, {message: "intPoseDetection"}, function (response) {
            });
        });
    }
});

