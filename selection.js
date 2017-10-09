var selectedText = "";
console.log("Hello from selection.js!");

// Generic Error Handler
function onError(error) {
    console.log(`${error}`);
}

function handleRightClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
    browser.storage.local.get("gridMode").then(function(data) {
        if (data.gridMode) {
            
            console.log("cancelable: " + e.cancelable);
            console.log("mouse button: " + e.buttons);
            console.log("target: " + e.target);
            console.log("screenX: " + e.screenX + ", screenY: " + e.screenY);
            console.log("clientX: " + e.clientX + ", clientY: " + e.clientY);
            browser.storage.sync.get(null).then(buildIconGrid, onError);
        } else {
            getSelectionText();
        }
    }, onError);
    return false;
}

function buildIconGrid(data) {

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