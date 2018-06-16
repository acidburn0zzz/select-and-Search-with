const logToConsole = true;
const base64ContextSearchIcon = "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";

/// Global variables
var searchEngines = {};
var selectedText = "";
var shiftKey = false;
var range = null;

/// Generic Error Handler
function onError(error) {
    console.log(`${error}`);
}

getGridSettings();

// Right-click event listener
document.addEventListener("contextmenu", handleRightClickWithoutGrid);

/// Handle Incoming Messages
// Listen for messages from the background script
browser.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "setGridMode":
			if (logToConsole) console.log("Grid mode received in selection.js, value is " + JSON.stringify(message.data));
            setGrid(message.data);
            break;
		default:
			break;
	}
});

function getGridSettings() {
    browser.storage.sync.get("options").then((options) => setGrid({"gridOff": options.gridOff}), onError);
}

function setGrid(data) {
    if (logToConsole) console.log("selection.js says gridOff is: " + data.gridOff + " while data is " + JSON.stringify(data));
    if (data.gridOff === true) {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        document.addEventListener("click", handleShiftClickWithGrid);
    } else {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("click", handleShiftClickWithGrid);
    }
}

function handleShiftClickWithGrid(e) {
    // Exit function if shift key isn't pressed whilst clicking
    if (!shiftKey) return;

    let sel = window.getSelection();
    sel.empty();
    sel.addRange(range);
    let selectedTextValue = sel.toString();
    selectedText = selectedTextValue.trim();

    let x = e.clientX;
    let y = e.clientY;

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

        sendSelectionTextAndCurrentTabUrl();
        browser.storage.sync.get(null).then(function(data){
            searchEngines = sortByIndex(data);
            buildIconGrid(x, y);
        }, onError);
        return false;
    }
}

function handleRightClickWithoutGrid(e) {
    getSelectionTextValue();
    sendSelectionTextAndCurrentTabUrl();
}

function getSelectionTextValue() {
    var selectedTextValue = ""; // Get the current value, not a cached value

    if (window.getSelection){ // All modern browsers and IE9+
        selectedTextValue = window.getSelection().toString();
    }
    if (document.activeElement != null && (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT")){
        let selectedTextInput = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd);
        if (selectedTextInput != "") selectedTextValue = selectedTextInput;
    }

    selectedText = selectedTextValue.trim();
}

function sendSelectionTextAndCurrentTabUrl(){
    // Send the selected text to background.js
    if (selectedText != "") sendMessage("getSelectionText", selectedText);

    // Send url of Google search within current site to background.js
    const url = window.location.href;
    const urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    const domain = urlParts[0];
    targetUrl = "https://www.google.com/search?q=site" + encodeUrl(":" + domain + " " + selectedText);
    sendMessage("sendCurrentTabUrl", targetUrl);
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
            let src = "data:image/png;base64,";
            if (searchEngines[id].base64 !== null && searchEngines[id].base64 !== undefined && searchEngines[id].base64 !== "") {
                src += searchEngines[id].base64;
            } else {
                // Default icon when no favicon could be found
                src += base64ContextSearchIcon;
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

    let body = document.getElementsByTagName("body")[0];
    body.appendChild(nav);

    // Position icon grid contained in nav element
    nav.style.left = 0;
    nav.style.top = 0;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let navWidth = nav.offsetWidth;
    let navHeight = nav.offsetHeight;
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

function onKeyDown(e) {
    console.log(e);
    // If Escape key is pressed e.keyCode === 27
    if (e.escKey) {
        let nav = document.getElementById("cs-grid");
        nav.style.display = "none";
    }
    // If the Shift key is pressed
    if (e.shiftKey) {
        shiftKey = true;
        let sel = window.getSelection();
        range = sel.getRangeAt(0);
    }
}

function onKeyUp(e) {
    shiftKey = false;
    range = null;
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
