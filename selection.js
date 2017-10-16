/// Global variables
var selectedText = "";
var gridMode = false; // By default grid mode is turned off

/// Generic Error Handler
function onError(error) {
    console.log(`${error}`);
}

init();

/// Initialise grid mode
function init() {
    browser.storage.local.get("gridMode").then(function(data){
        if (data.gridMode === true || data.gridMode === false) {
            gridMode = data.gridMode;
            if (gridMode) { // If gridMode is now set
                document.addEventListener("contextmenu", handleRightClickWithGrid);
            } else { // If gridMode is turned off
                document.addEventListener("contextmenu", handleRightClickWithoutGrid);
            }
        }
    }, onError);
}

/// Handle gridMode local storage changes
function onStorageChanges(changes, area) {
    if (area === "local" && Object.keys(changes).includes("gridMode")) {
        gridMode = changes["gridMode"].newValue;
        if (changes["gridMode"].oldValue) { // If gridMode had been set
            document.removeEventListener("contextmenu", handleRightClickWithGrid);
        } else { // If gridMode had not been set
            document.removeEventListener("contextmenu", handleRightClickWithoutGrid);
        }
        if (gridMode) { // If gridMode is now set
            document.addEventListener("contextmenu", handleRightClickWithGrid);
        } else { // If gridMode is turned off
            document.addEventListener("contextmenu", handleRightClickWithoutGrid);
        }
    }
}

function handleRightClickWithGrid(e) {
	let selectionTextValue = getSelectionTextValue();
	if (selectionTextValue != "") {
		if (e.target.tagName == "A") {
			// Do additional safety checks.
			if(e.target.textContent.indexOf(selectionTextValue) === -1 && selectionTextValue.indexOf(e.target.textContent) === -1){
				// This is not safe. There is a selection on the page, but the element that right clicked does not contain a part of the selection
				return;
			}
        }

		// Test URL: https://bugzilla.mozilla.org/show_bug.cgi?id=1215376
		// Test URL: https://github.com/odebroqueville/contextSearch/

        e.preventDefault();
        e.stopPropagation();
        sendSelectionTextAndCurrentTabUrl();
        browser.storage.sync.get(null).then(function(data){
            let searchEngines = sortByIndex(data);
            for (let id in searchEngines) {
                if (searchEngines[id].base64 === undefined) {
                    let url = searchEngines[id].url;
                    let urlParts = url.replace('http://','').replace('https://','').split(/\//);
                    let domain = urlParts[0];
                    searchEngines[id]["base64"] = getBase64Image(domain);
                }
            }
            console.log(searchEngines);
            browser.storage.sync.set(searchEngines).then(null, onError);
            buildIconGrid(searchEngines, e);
        }, onError);
        return false;
	}
}

function handleRightClickWithoutGrid(e) {
    sendSelectionTextAndCurrentTabUrl();
}

function getBase64Image(url) {
    const getFaviconUrl = 'https://24tndrsrgl.execute-api.eu-central-1.amazonaws.com/prod/getFaviconUrl'
    var xhr = new XMLHttpRequest();
    xhr.open('POST', getFaviconUrl, true);
    xhr.setRequestHeader("x-api-key", "API KEY GOES HERE");
    xhr.responseType = 'arraybuffer';
  
    xhr.onload = function(e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var blob = this.response;
            var str = btoa(String.fromCharCode.apply(null, new Uint8Array(blob)));
            return str;
        } else if (xhr.readyState === 4 && xhr.status !== 200) { // Return default icon base64 string corresponding to a globe
            return "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC";
        }
    };
    xhr.send({"url": url});
};

function buildIconGrid(searchEngines, e) {
    let arrIDs = Object.keys(searchEngines);

    // Grid dimensions
    let n = arrIDs.length; // Number of search engines
    let m = Math.round(Math.sqrt(n)); // Grid dimension: m x m matrix
    let r = Math.ceil(Math.abs(n-m*m)/m); // Number of rows
    let item = [];
    if (m * m <= n) {
        r = m + r;
    } else {
        r = m + 1 - r;
    }
    const PLUS24 = 30; // 24px plus 3px margin/padding
    let width = PLUS24 * m;

    // Cleanup
    let navExisting = document.getElementById("cs-grid");
    if (navExisting != null) {
		navExisting.parentElement.removeChild(navExisting);
    }

    let nav = document.createElement("nav");
    nav.setAttribute("id", "cs-grid");
    nav.style.display = "block";
    nav.style.backgroundColor = "white";
    nav.style.border = "2px solid #999";
    nav.style.width = width.toString() + "px";
    nav.style.zIndex = 999;
    nav.style.position = "fixed";
    nav.style.setProperty("top", e.clientY.toString() + "px");
    nav.style.setProperty("left", e.clientX.toString() + "px");
    let ol = document.createElement("ol");
    ol.style.margin = "0";
    ol.style.padding = "0";
    for (let i=0; i < r ;i++) {
        let liRow = document.createElement("li");
        liRow.style.listStyleType = "none";
        liRow.style.margin = "0px";
        liRow.style.padding = "0px";
        let olRow = document.createElement("ol");
        olRow.style.margin = "0";
        olRow.style.padding = "0";
        for (let j=0; j < m ;j++) {
            let liItem = document.createElement("li");
            liItem.style.display = "inline-block";
            liItem.style.listStyleType = "none";
            let img = document.createElement("img");
            img.style.display = "inline-block";
            let id = arrIDs[i * m + j];
            let src = "data:image/png;base64," + searchEngines[id].base64;
            let title = searchEngines[id].name;
            liItem.setAttribute("id", id);
            liItem.style.margin = "0px";
            liItem.style.padding = "0px";
			img.setAttribute("src", src);
            img.setAttribute("title", title);
            img.style.margin = "0px";
            img.style.padding = "0px";
            img.style.border = "3px solid #fff";
            img.style.width = "24px";
            img.style.height = "24px";
            img.addEventListener("mouseover", addBorder);
            img.addEventListener("mouseleave", removeBorder);
            liItem.appendChild(img);
            olRow.appendChild(liItem);
            if (i * m + j === n - 1) break;
        }
        liRow.appendChild(olRow);
        ol.appendChild(liRow);
    }
    nav.appendChild(ol);
    nav.addEventListener("click", onGridClick);
    nav.addEventListener("mouseleave", onLeave);
    document.addEventListener("keypress", checkForEscKey);
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(nav);
}

function onGridClick(e) {
    let nav = document.getElementById("cs-grid");
    nav.style.display = "none";
    nav.removeEventListener("click", onGridClick);
    nav.removeEventListener("mouseleave", onLeave);
    nav = null;
    sendMessage("doSearch", e.target.parentNode.id);
}

function onLeave(e) {
    let nav = e.target;
    nav.style.display = "none";
    nav.removeEventListener("click", onGridClick);
    nav.removeEventListener("mouseleave", onLeave);
    nav = null;
}

function checkForEscKey(e) {
    console.log(e);
    if (e.keyCode === 27) {
        let nav = document.getElementById("cs-grid");
        nav.style.display = "none";
        document.removeEventListener("keypress", checkForEscKey);
    }
}

function addBorder(e) {
    console.log(e);
    console.log(e.target.tagName);
    if (e.target.tagName === "IMG") {
        e.target.style.border = "3px solid #999";
    }
}

function removeBorder(e) {
    console.log(e);
    console.log(e.target.tagName);
    if (e.target.tagName === "IMG") {
        e.target.style.border = "3px solid #fff";
    }
}

function getSelectionTextValue(){
	var selectedTextValue = ""; // get the current value, not a cached value
	
	if (window.getSelection){ // all modern browsers and IE9+
        selectedTextValue = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedTextValue = selectedTextInput;
    }
    
    return selectedTextValue;
}

function sendSelectionTextAndCurrentTabUrl(){
    selectedText = getSelectionTextValue();
    if (selectedText != "") sendMessage("getSelectionText", selectedText);

    // send current tab url to background.js
    const url = window.location.href;
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeURIComponent(":" + domain + " " + selectedText);
    sendMessage("sendCurrentTabUrl", targetUrl);
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}

browser.storage.onChanged.addListener(onStorageChanges);
