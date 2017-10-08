var selectedText = "";

function handleRightClick(e) {
    console.log(e);
    browser.storage.local.get("gridMode").then(function(data) {
        if (data.gridMode) {
            e.preventDefault();
            console.log("cancelable: " + e.cancelable);
            console.log("target: " + e.target);
            console.log("screenX: " + e.screenX + ", screenY: " + e.screenY);
            console.log("clientX: " + e.clientX + ", clientY: " + e.clientY);
            return false;
        } else {
            getSelectionText();
        }
    });
}

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

document.addEventListener("contextmenu", handleRightClick);