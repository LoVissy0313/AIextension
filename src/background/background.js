// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    if (request.action === "getStorageData") {
        chrome.storage.local.get(request.key, (result) => {
            sendResponse({ data: result[request.key] });
        });
        return true;
    }
});