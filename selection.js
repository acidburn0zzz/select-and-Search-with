function getSelectionText(){
    let selectedText = "";
    
    browser.tabs.getCurrent().then(hasActiveTab, onError);

    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedText = selectedTextInput;
    }
    
    if (selectedText != "") browser.runtime.sendMessage({"selection": selectedText});
}

function hasActiveTab(tabInfo) {
    console.log(tabInfo);
    const url = tabInfo.url;
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeURIComponent(":" + domain + " " + selection);
    browser.runtime.sendMessage({"targetUrl": targetUrl});
}

document.addEventListener("contextmenu", getSelectionText);
