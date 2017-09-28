var selectedText = "";

function getSelectionText(){
    
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedText = selectedTextInput;
    }
    
    if (selectedText != "") sendMessage("getSelectionText", selectedText);

    // send current tab url to background.js
    const url = window.location.href;
    sendCurrentTabUrl(url);
}

function sendCurrentTabUrl(url) {
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeURIComponent(":" + domain + " " + selectedText);
    sendMessage("sendCurrentTabUrl", targetUrl);
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

function handleMessage(message) {
    console.log(message.action);
    console.log(message.data);
    switch (message.action) {
        case "openUrlInSameTab":
            location.assign(message.data);
            break;
        default:
            break;
    }
}

browser.runtime.onMessage.addListener(handleMessage);
document.addEventListener("contextmenu", getSelectionText);