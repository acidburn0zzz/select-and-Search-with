function getSelectionText(){
    let selectedText = "";
    
    if (window.getSelection){ // all modern browsers and IE9+
        selectedText = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedText = selectedTextInput;
    }
    
    if (selectedText != "") browser.runtime.sendMessage(selectedText);
}

document.addEventListener("contextmenu", getSelectionText);
