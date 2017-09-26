// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");
const tabActive = document.getElementById("tabActive");
var storageSyncCount = 0;

// Sending messages to the background script
function sendMessage(action, data){
	browser.runtime.sendMessage({action: action, data: data});
}

function notify(message){
	sendMessage("notify", message);
}

// Generic Error Handler
function onError(error) {
  console.log(`Error: ${error}`);
}

// Load list of search engines
function loadSearchEngines(jsonFile) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", jsonFile, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.overrideMimeType("application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var searchEngines = JSON.parse(this.responseText);
            console.log("Search engines have been loaded.");
            generateHTML(searchEngines);
            saveOptions();
        }
    };
    xhr.send();
}

function upEventHandler(e) {
    e.stopPropagation();
    moveSearchEngineUp(e);
}

function downEventHandler(e) {
    e.stopPropagation();
    moveSearchEngineDown(e);
}

function removeEventHandler(e) {
    e.stopPropagation();
    removeSearchEngine(e);
}

function sortByIndex(list) {
  var sortedList = {};
  for (var i = 0;i < Object.keys(list).length;i++) {
    for (let se in list) {
      if (list[se].index === i) {
        sortedList[se] = list[se];
      }
    }
  }
  return sortedList;
}

function generateHTML(list) {
    var searchEngines = sortByIndex(list);
    var divSearchEngines = document.createElement("ol");
    divSearchEngines.setAttribute("id", "searchEngines");
    for (let se in searchEngines) {
        var lineItem = document.createElement("li");
        var labelSE = document.createElement("label");
        var inputSE = document.createElement("input");
        var inputQS = document.createElement("input");
        var textSE = document.createTextNode(searchEngines[se].name);

        if (Object.keys(searchEngines).length > 1) {
            var upButton = document.createElement("button");
            var textUpButton = document.createTextNode("↑");
            upButton.setAttribute("class", "up");
            upButton.setAttribute("title", "Move " + searchEngines[se].name + " up");
            upButton.appendChild(textUpButton);
            var downButton = document.createElement("button");
            var textDownButton = document.createTextNode("↓");
            downButton.setAttribute("class", "down");
            downButton.setAttribute("title", "Move " + searchEngines[se].name + " down");
            downButton.appendChild(textDownButton);
            var removeButton = document.createElement("button");
            var textRemoveButton = document.createTextNode("Remove");
            removeButton.setAttribute("class", "remove");
            removeButton.setAttribute("title", "Remove " + searchEngines[se].name);
            removeButton.appendChild(textRemoveButton);
            lineItem.setAttribute("id", se);

            labelSE.setAttribute("for", se + "-cbx");
            labelSE.appendChild(textSE);
            inputSE.setAttribute("type", "checkbox");
            inputSE.setAttribute("id", se + "-cbx");
            inputSE.checked = searchEngines[se].show;
            inputQS.setAttribute("type", "url");
            inputQS.setAttribute("value", searchEngines[se].url);
            lineItem.appendChild(inputSE);
            lineItem.appendChild(labelSE);
            lineItem.appendChild(inputQS);

            upButton.addEventListener("click", upEventHandler, false);
            lineItem.appendChild(upButton);

            downButton.addEventListener("click", downEventHandler, false);
            lineItem.appendChild(downButton);

            removeButton.addEventListener("click", removeEventHandler, false);
            lineItem.appendChild(removeButton);
        } else {
            lineItem.setAttribute("id", se);
            labelSE.setAttribute("for", se + "-cbx");
            labelSE.appendChild(textSE);
            inputSE.setAttribute("type", "checkbox");
            inputSE.setAttribute("id", se + "-cbx");
            inputSE.checked = searchEngines[se].show;
            inputQS.setAttribute("type", "url");
            inputQS.setAttribute("value", searchEngines[se].url);
            lineItem.appendChild(inputSE);
            lineItem.appendChild(labelSE);
            lineItem.appendChild(inputQS);
        }
        divSearchEngines.appendChild(lineItem);
    }
    divContainer.appendChild(divSearchEngines);
    var lineItems = divSearchEngines.childNodes;
    storageSyncCount = lineItems.length;
}

function clearAll() {
    var divSearchEngines = document.getElementById("searchEngines");
    var lineItems = divSearchEngines.childNodes;
    for (i=0;i<lineItems.length;i++) {
        var input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            input.checked = false;
        }
    }
}

function selectAll() {
    var divSearchEngines = document.getElementById("searchEngines");
    var lineItems = divSearchEngines.childNodes;
    for (i=0;i<lineItems.length;i++) {
        var input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            input.checked = true;
        }
    }
}

function reset() {
    var divSearchEngines = document.getElementById("searchEngines");
    divContainer.removeChild(divSearchEngines);
    browser.storage.sync.clear().then(loadSearchEngines("defaultSearchEngines.json"), onError);
}

function moveSearchEngineUp(e) {
    var lineItem = e.target.parentNode;
    var sibling = lineItem.previousSibling;

    var pn = lineItem.parentNode;
    pn.removeChild(lineItem);
    pn.insertBefore(lineItem, sibling);

    // Update index in storage
    browser.storage.sync.clear().then(saveOptions(false), onError);
}

function moveSearchEngineDown(e) {
    var lineItem = e.target.parentNode;
    var sibling = lineItem.nextSibling;

    var pn = lineItem.parentNode;
    pn.removeChild(sibling);
    pn.insertBefore(sibling, lineItem);

    // Update index in storage
    browser.storage.sync.clear().then(saveOptions(false), onError);
}

function removeSearchEngine(e) {
    var lineItem = e.target.parentNode;
        
    lineItem.parentNode.removeChild(lineItem);
    browser.storage.sync.clear().then(saveOptions(false), onError);
}

function readData() {
    var divSearchEngines = document.getElementById("searchEngines");
    var options = {};
    var lineItems = divSearchEngines.childNodes;
    storageSyncCount = lineItems.length;
    for (var i = 0;i < storageSyncCount;i++) {
        var input = lineItems[i].firstChild;
        if (input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            var label = input.nextSibling;
            var url = label.nextSibling;
            options[lineItems[i].id] = {};
            options[lineItems[i].id]["index"] = i;
            options[lineItems[i].id]["name"] = label.textContent;
            options[lineItems[i].id]["url"] = url.value;
            options[lineItems[i].id]["show"] = input.checked;
        }
    }
    return options;
}

// Save the list of search engines to be displayed in the context menu
function save(){
	saveOptions(true);
}

function saveOptions(notification) {
    var options = readData();
    if (notification == true) {
		browser.storage.sync.set(options).then(notify("Saved preferences."), onError);
	} else {
		browser.storage.sync.set(options).then(null, onError);
	}
}

function onAdded() {
    // Clear HTML input fields to add a search engine
    show.checked = false;
    name.value = "";
    url.value = "";
    restoreOptions();
    notify("Search engine added.");
}

function addSearchEngine() {
    const show = document.getElementById("show"); // Boolean
    const name = document.getElementById("name"); // String
    const url = document.getElementById("url"); // String
    strUrl = url.value;
    var testUrl = "";
    if (strUrl.includes("{search terms}")) {
        testUrl = strUrl.replace("{search terms}", "test");
    } else {
        testUrl = strUrl + "test";
    }
    if (url.validity.typeMismatch || !isValidUrl(testUrl)) {
        notify("Url entered is not valid.");
        return;
    }
    const id = name.value.replace(" ", "-").toLowerCase();
    var newSearchEngine = {};
    newSearchEngine[id] = {"index": storageSyncCount, "name": name.value, "url": url.value, "show": show.checked};
    browser.storage.sync.set(newSearchEngine).then(onAdded, onError);
}

function onGot(searchEngines) {
    console.log(searchEngines);
    if (Object.keys(searchEngines).length > 0) { // storage sync isn't empty
        generateHTML(searchEngines); // display search engines list
        console.log("Saved search engines have been loaded.");
    } else { // storage sync is empty -> load default list of search engines
        browser.storage.sync.clear().then(loadSearchEngines("defaultSearchEngines.json"), onError);
    }
}

function onHas(bln) {
    if (bln.tabActive === true || bln.tabActive === false) tabActive.checked = bln.tabActive
}

function onNone() {
    browser.storage.local.set({"tabActive": tabActive.checked});
}

// Restore the list of search engines to be displayed in the context menu from the local storage
function restoreOptions() {
    console.log("Loading search engines...");
    browser.storage.sync.get(null).then(onGot, onError);
    browser.storage.local.get("tabActive").then(onHas, onNone);
}

function removeHyperlink(event) {
    document.body.removeChild(event.target);
}

function saveToLocalDisk() {
    let gettingSearchEngines = browser.storage.sync.get();
    gettingSearchEngines.then(downloadSearchEngines, onError);
}

function downloadSearchEngines(searchEngines) {
    saveOptions();
    var fileToDownload = new File([JSON.stringify(searchEngines, null, 2)], {
        type: "text/json",
        name: "searchEngines.json"
    });
    var a = document.createElement("a");
    a.style.display = "none";
    a.download = "searchEngines.json";
    a.href = window.URL.createObjectURL(fileToDownload);
    a.onclick = removeHyperlink;
    document.body.appendChild(a);
    a.click();
}

function handleFileUpload() {
    var divSearchEngines = document.getElementById("searchEngines");
    divContainer.removeChild(divSearchEngines);
    browser.storage.sync.clear().then(function() {
        var upload = document.getElementById("upload");
        var jsonFile = upload.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var searchEngines = JSON.parse(event.target.result);
            generateHTML(searchEngines);
            saveOptions();
        };
        reader.readAsText(jsonFile);
    }, onError);
}

function saveTabActive(){
    browser.storage.local.set({"tabActive":tabActive.checked});
}

function isValidUrl(url) {
    try {
        (new URL(url));
        return true;
    }
    catch (e) {
        // Malformed URL
        return false;
    }
}

tabActive.addEventListener("click", saveTabActive);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("selectAll").addEventListener("click", selectAll);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("add").addEventListener("click", addSearchEngine);
document.getElementById("save").addEventListener("click", save);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFileUpload);
