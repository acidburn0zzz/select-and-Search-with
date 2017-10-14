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
	if(selectionTextValue != ""){
		if(e.target.tagName == "A"){
			// Do additional safety checks.
			if(e.target.textContent.indexOf(selectionTextValue) == -1 && selectionTextValue.indexOf(e.target.textContent) == -1){
				// This is not safe. There is a selection on the page, but the element that right clicked does not contain a part of the selection
				return;
			}
		}
		
		let isContentSecurityPolicy = false;

		let testElement = document.createElement("nav");
		let src = "https://s2.googleusercontent.com/s2/favicons?domain_url=https://duckduckgo.com";
		let img = document.createElement("img");
		img.setAttribute("src", src);
		img.style.display = "none";
		testElement.appendChild(img);
		
		let body = document.getElementsByTagName("body")[0];
		body.appendChild(testElement);
		if(img.height == 0){
			console.log("Page is not allowed to set image due to Content Security Policy. Falling back to context menu items...");
			isContentSecurityPolicy = true;
		}
		testElement.parentElement.removeChild(testElement);

		// Test URL: https://bugzilla.mozilla.org/show_bug.cgi?id=1215376
		// Test URL: https://github.com/odebroqueville/contextSearch/
		if(!isContentSecurityPolicy){
			e.preventDefault();
			e.stopPropagation();
			sendSelectionTextAndCurrentTabUrl();
			browser.storage.sync.get(null).then(function(data){
				buildIconGrid(data, e);
			}, onError);
			return false;
		}else{
			// Fall back to context menu items
			// This is done automatically, we don't have to do anything
		}
	}
}

function handleRightClickWithoutGrid(e) {
    sendSelectionTextAndCurrentTabUrl();
}

function buildIconGrid(data, e) {
    let searchEngines = sortByIndex(data);
    let arrIDs = Object.keys(searchEngines);
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

    // Cleanup.
    let navExisting = document.getElementById("cs-grid");
    if(navExisting != null){
		navExisting.parentElement.removeChild(navExisting);
    }

    let nav = document.createElement("nav");
    nav.setAttribute("id", "cs-grid");
    nav.style.display = "block";
    nav.style.backgroundColor = "white";
    nav.style.border = "1px solid #eee";
    nav.style.width = width.toString() + "px";
    nav.style.zIndex = 999;
    nav.style.position = "fixed";
    nav.style.setProperty("top", e.clientY.toString() + "px");
    nav.style.setProperty("left", e.clientX.toString() + "px");
    let ol = document.createElement("ol");
    ol.style.margin = "0";
    for (let i=0; i < r ;i++) {
        let liRow = document.createElement("li");
        liRow.style.listStyleType = "none";
        let olRow = document.createElement("ol");
        olRow.style.margin = "0";
        for (let j=0; j < m ;j++) {
            let liItem = document.createElement("li");
            liItem.style.display = "inline-block";
            liItem.style.listStyleType = "none";
            let img = document.createElement("img");
            img.style.display = "inline-block";
            let id = arrIDs[i * m + j];
            let src = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + searchEngines[id].url;
            let title = searchEngines[id].name;
            liItem.setAttribute("id", id);
            liItem.style.padding = "3px";
			img.setAttribute("src", src);
            img.setAttribute("title", title);
            img.style.width = "24px";
            img.style.height = "24px";
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
    sendMessage("doSearch", e.target.parentNode.id);
}

function onLeave(e) {
    let nav = e.target;
    nav.style.display = "none";
    nav.removeEventListener("mouseleave", onLeave);
}

function checkForEscKey(e) {
    console.log(e);
    if (e.keyCode === 27) {
        let nav = document.getElementById("cs-grid");
        nav.style.display = "none";
        document.removeEventListener("keypress", checkForEscKey);
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
