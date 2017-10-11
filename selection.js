var selectedText = "";
console.log("Hello from selection.js!");

// Generic Error Handler
function onError(error) {
    console.log(`${error}`);
}

function handleRightClick(e) {
    e.preventDefault();
    e.stopPropagation();
    getSelectionText();
    browser.storage.local.get("gridMode").then(function(data) {
        if (data.gridMode) {
            browser.storage.sync.get(null).then(function(data){
                buildIconGrid(data, e);
            }, onError);
        };
    }, onError);
    return false;
}

function buildIconGrid(data, e) {
    console.log(e);
    let searchEngines = sortByIndex(data);
    console.log(data);
    let arrIDs = Object.keys(searchEngines);
    let n = arrIDs.length; // Number of search engines
    let m = Math.round(Math.sqrt(n)); // Grid dimension: m x m matrix
    let r = Math.ceil((n-m*m)/m); // Number of rows
    let item = [];
    if (m * m <= n) {
        r = m + Math.ceil((n-m*m)/m);
    } else {
        r = m + 1 - Math.ceil((m*m-n)/m);
    }
    let nav = document.createElement("nav");
    nav.style.zIndex = 999;
    nav.style.position = "absolute";
    nav.style.top = e.clientY;
    nav.style.left = e.clientX;
    let ol = document.createElement("ol");
    for (let i=0; i < r ;i++) {
        let liRow = document.createElement("li");
        let olRow = document.createElement("ol");
        for (let j=0; j < m ;j++) {
            let liItem = document.createElement("li");
            let img = document.createElement("img");
            let id = arrIDs[i * m + j];
            console.log(id);
            let src = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + searchEngines[id].url;
            let alt = searchEngines[id].name;
            liItem.setAttribute("id", id);
            img.setAttribute("src", src);
            img.setAttribute("alt", alt);
            img.setAttribute("width", 36);
            img.setAttribute("height", 36);
            liItem.appendChild(img);
            olRow.appendChild(liItem);
            if (i * m + j === n - 1) break;
        }
        liRow.appendChild(olRow);
        ol.appendChild(liRow);
    }
    nav.appendChild(ol);
    nav.addEventListener("click", onGridClick);
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(nav);
}

function onGridClick(e) {
    console.log(e.target);
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

/// Sort search engines by index
function sortByIndex(list) {
    var sortedList = {};
    var skip = false;
    
    // If there are no indexes, then add some arbitrarily
    for (var i = 0;i < Object.keys(list).length;i++) {
		var id = Object.keys(list)[i];
		if (list[id].index != null) {
			break;
		} 
		if (list[id] != null) {
			sortedList[id] = list[id];
			sortedList[id]["index"] = i;
			skip = true;
		}
    }

    for (var i = 0;i < Object.keys(list).length;i++) {
      for (let id in list) {
        if (list[id] != null && list[id].index === i) {
          sortedList[id] = list[id];
        }
      }
    }
    return sortedList;
}

document.addEventListener("contextmenu", handleRightClick);