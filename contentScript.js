chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getHeaders") {
            // Handle the request here and send a response
            sendResponse({headers: "your headers data here"});
        }
    });
