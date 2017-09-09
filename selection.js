var selectedText = "";

function getSelectionText(){
    
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedText = selectedTextInput;
    }
    
    if (selectedText != "") browser.runtime.sendMessage({"selection": selectedText});

    // send current tab url to background.js
    const url = window.location.href;
    sendCurrentTabUrl(url);
}

function sendCurrentTabUrl(url) {
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeURIComponent(":" + domain + " " + selectedText);
    browser.runtime.sendMessage({"targetUrl": targetUrl});
}

document.addEventListener("contextmenu", getSelectionText);
