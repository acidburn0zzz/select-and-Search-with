/// Global variables
var searchEngines = {};
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
    let x = e.clientX;
    let y = e.clientY;
	getSelectionTextValue(x, y);
	if (selectedText !== "") {
		if (e.target.tagName == "A") {
			// Do additional safety checks.
			if (e.target.textContent.indexOf(selectedText) === -1 && selectedText.indexOf(e.target.textContent) === -1){
				// This is not safe. There is a selection on the page, but the element that right clicked does not contain a part of the selection
				return;
			}
        }

		// Test URL: https://bugzilla.mozilla.org/show_bug.cgi?id=1215376
		// Test URL: https://github.com/odebroqueville/contextSearch/

        e.preventDefault();
        e.stopPropagation();
        sendSelectionTextAndCurrentTabUrl(x, y);
        browser.storage.sync.get(null).then(function(data){
            searchEngines = sortByIndex(data);
            buildIconGrid(x, y);
        }, onError);
        return false;
	}
}

function handleRightClickWithoutGrid(e) {
    let x = e.clientX;
    let y = e.clientY;
    getSelectionTextValue(x, y);
    sendSelectionTextAndCurrentTabUrl(x, y);
}

function buildIconGrid(x, y) {
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
    const ICON32 = 38; // icon width is 32px plus 3px margin/padding
    let width = ICON32 * m;

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
    nav.style.zIndex = 999;
    nav.style.position = "fixed";
    nav.style.setProperty("top", y.toString() + "px");
    nav.style.setProperty("left", x.toString() + "px");
    let ol = document.createElement("ol");
    ol.style.margin = "0px";
    ol.style.padding = "0px";
    for (let i=0; i < r ;i++) {
        let liRow = document.createElement("li");
        liRow.style.listStyleType = "none";
        liRow.style.margin = "0px";
        liRow.style.padding = "0px";
        liRow.style.height = "38px";
        let olRow = document.createElement("ol");
        olRow.style.margin = "0px";
        olRow.style.padding = "0px";
        olRow.style.height = "38px";
        for (let j=0; j < m ;j++) {
            let liItem = document.createElement("li");
            liItem.style.display = "inline-block";
            liItem.style.listStyleType = "none";
            liItem.style.width = "38px";
            liItem.style.height = "38px";
            let img = document.createElement("img");
            img.style.display = "inline-block";
            let id = arrIDs[i * m + j];
            let url = searchEngines[id].url;
            let urlParts = url.replace('http://','').replace('https://','').split(/\//);
            let domain = urlParts[0];
            var src = "https://icons.better-idea.org/icon?url=" + domain + "&size=24..32..64";
            if (searchEngines[id].base64 !== null && searchEngines[id].base64 !== undefined && searchEngines[id].base64 !== "") {
                src = "data:image/png;base64," + searchEngines[id].base64;
            }
            let title = searchEngines[id].name;
            liItem.setAttribute("id", id);
            liItem.style.margin = "0px";
            liItem.style.padding = "0px";
			img.setAttribute("src", src);
            img.setAttribute("title", title);
            img.style.margin = "0px";
            img.style.padding = "0px";
            img.style.border = "3px solid #fff";
            img.style.width = "32px";
            img.style.height = "32px";
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

    document.addEventListener("keydown", checkForEscKey);
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(nav);

    // Position icon grid contained in nav element
    nav.style.left = 0;
    nav.style.top = 0;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let navWidth = nav.offsetWidth;
    let navHeight = nav.offsetHeight;
    console.log("viewport width: " + viewportWidth);
    console.log("viewport height: " + viewportHeight);
    console.log("icon grid width: " + navWidth);
    console.log("icon grid height: " + navHeight);
    console.log("x: " + x);
    console.log("y: " + y);
    if (x > viewportWidth - navWidth) {
        nav.style.left = viewportWidth - navWidth + "px";
    } else {
        nav.style.left = x + "px";
    }
    if (y > viewportHeight - navHeight) {
        nav.style.top = viewportHeight - navHeight + "px";
    } else {
        nav.style.top = y + "px";
    }
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

function getSelectionTextValue(x, y) {
	var selectedTextValue = ""; // get the current value, not a cached value
	
	if (window.getSelection){ // all modern browsers and IE9+
        selectedTextValue = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedTextValue = selectedTextInput;
    }
    
    if (selectedTextValue === "") {
        selectedTextValue = handleEmptySelection(x, y);
    }

    selectedText = selectedTextValue;
}

function handleEmptySelection(x, y) {
    var range, node, offset, text, selection, startOffset, endOffset;
    var strWord = "", word = "";
    var pattern = /(\w+)/;

    if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(x, y);
        node = range.offsetNode;
        offset = range.offset;
    } else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
        node = range.startContainer;
        offset = range.startOffset;
    }
  
    if (node.nodeType == 3) {
        text = node.textContent;
        let strA = text.substring(0, offset + 1).trim();
        let strB = text.substring(offset + 1, text.length);
        startOffset = strA.lastIndexOf(" ") + 1;
        strWord = strA.substring(startOffset, strA.length);
        if (strB.charAt(0) !== " ") {
            strWord += strB.substring(0, strB.indexOf(" "));
        }
        word = pattern.exec(strWord)[0];
    }

    if (word !== "") {
        selection = window.getSelection();
        endOffset = startOffset + word.length;
        let selectionRange = document.createRange();
        selectionRange.setStart(node, startOffset);
        selectionRange.setEnd(node, endOffset);
        selection.removeAllRanges();
        selection.addRange(selectionRange);
    }

    return word;
}

function sendSelectionTextAndCurrentTabUrl(x, y){
    // Send the selected text to background.js
    if (selectedText != "") sendMessage("getSelectionText", selectedText);

    // Send url of Google search within current site to background.js
    const url = window.location.href;
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeUrl(":" + domain + " " + selectedText);
    sendMessage("sendCurrentTabUrl", targetUrl);
}

browser.storage.onChanged.addListener(onStorageChanges);

/// Encode a url
function encodeUrl(url) {
    if (isEncoded(url)) {
        return url;
    }
    return encodeURIComponent(url);
}

/// Verify is uri is encoded
function isEncoded(uri) {
    uri = uri || "";  
    return uri !== decodeURIComponent(uri);
}

function sendMessage(action, data){
	browser.runtime.sendMessage({"action": action, "data": data});
}