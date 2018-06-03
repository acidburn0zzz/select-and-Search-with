/// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");
const show = document.getElementById("show"); // Boolean
const name = document.getElementById("name"); // String
const keyword = document.getElementById("keyword"); // String
const multitab = document.getElementById("multitab"); // Boolean
const url = document.getElementById("url"); // String
const openNewTab = document.getElementById("openNewTab");
const openNewWindow = document.getElementById("openNewWindow");
const sameTab = document.getElementById("sameTab");
const tabMode = document.getElementById("tabMode");
const tabActive = document.getElementById("tabActive");
const active = document.getElementById("active");
const optionsMenuLocation = document.getElementById("optionsMenuLocation");
const getFavicons = document.getElementById("getFavicons");
let divSearchEngines = document.getElementById("searchEngines");
let storageSyncCount = 0;
var searchEngines = {};

// Translation variables
const move = browser.i18n.getMessage("move");
const up = browser.i18n.getMessage("up");
const down = browser.i18n.getMessage("down");
const remove = browser.i18n.getMessage("remove");
const multipleSearchEnginesSearch = browser.i18n.getMessage("multipleSearchEnginesSearch");
const titleShowEngine = browser.i18n.getMessage("titleShowEngine");
const placeHolderKeyword = browser.i18n.getMessage("placeHolderKeyword");
const notifySearchEngineAdded = browser.i18n.getMessage("notifySearchEngineAdded");

// Send a message to the background script
function sendMessage(action, data) {
    browser.runtime.sendMessage({"action": action, "data": data});
}

// Notification
function notify(message) {
    sendMessage("notify", message);
}

// Generic Error Handler
function onError(error) {
  console.log(`${error}`);
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
    let sortedList = {};
    let skip = false;

    // If there are no indexes, then add some arbitrarily
    for (let i = 0;i < Object.keys(list).length;i++) {
        let id = Object.keys(list)[i];
        if (list[id].index != null) {
            break;
        }
        if (list[id] != null) {
            sortedList[id] = list[id];
            sortedList[id]["index"] = i;
            skip = true;
        }
    }

    // If there are indexes, then sort the list
    if (!skip) {
       for (let i = 0;i < Object.keys(list).length;i++) {
           for (let id in list) {
               if (list[id] != null && list[id].index === i) {
                    sortedList[id] = list[id];
               }
           }
       }
    }
  
    return sortedList;
}

function listSearchEngines(list) {
    let divSearchEngines = document.getElementById("searchEngines");
    if (divSearchEngines != null) divContainer.removeChild(divSearchEngines);

    searchEngines = sortByIndex(list);
    divSearchEngines = document.createElement("ol");
    divSearchEngines.setAttribute("id", "searchEngines");
    for (let id in searchEngines) {
        let searchEngine = searchEngines[id];
        let lineItem = createLineItem(id, searchEngine);
        divSearchEngines.appendChild(lineItem);
    }
    divContainer.appendChild(divSearchEngines);
    storageSyncCount = divSearchEngines.childNodes.length;

}

function createButton(ioniconClass, btnClass, btnTitle) {
    let button = document.createElement("button");
    let btnIcon = document.createElement("i");
    button.setAttribute("type", "button");
    button.setAttribute("class", btnClass);
    button.setAttribute("title", btnTitle);
    btnIcon.setAttribute("class", "icon " + ioniconClass);
    button.appendChild(btnIcon);
    return button;
}

function createLineItem(id, searchEngine) {
    let lineItem = document.createElement("li");

    let inputName = document.createElement("input");
    let labelName = document.createElement("label");
    let textName = document.createTextNode(searchEngine.name);

    let inputKeyword = document.createElement("input");

    let inputMultiTab = document.createElement("input");
    
    let inputQueryString = document.createElement("input");

    let upButton = createButton("ion-ios-arrow-up", "up", move + " " + searchEngine.name + " " + up);
    let downButton = createButton("ion-ios-arrow-down", "down", move + " " + searchEngine.name + " " + down);
    let removeButton = createButton("ion-ios-trash", "remove", remove + " " + searchEngine.name);
    upButton.addEventListener("click", upEventHandler, false);
    downButton.addEventListener("click", downEventHandler, false);
    removeButton.addEventListener("click", removeEventHandler, false);

    lineItem.setAttribute("id", id);

    inputName.setAttribute("type", "checkbox");
    inputName.setAttribute("title", titleShowEngine);
    inputName.setAttribute("id", id + "-cbx");
    inputName.checked = searchEngine.show;

    labelName.setAttribute("for", id + "-cbx");
    labelName.appendChild(textName);

    inputKeyword.setAttribute("type", "text");
    inputKeyword.setAttribute("id", id + "-kw");
    inputKeyword.setAttribute("class", "keyword");
    inputKeyword.setAttribute("placeholder", placeHolderKeyword);
    inputKeyword.setAttribute("value", searchEngine.keyword);

    inputMultiTab.setAttribute("type", "checkbox");
    inputMultiTab.setAttribute("id", id + "-mt");
    inputMultiTab.setAttribute("title", multipleSearchEnginesSearch);

    inputMultiTab.checked = searchEngine.multitab;

    inputQueryString.setAttribute("type", "url");
    inputQueryString.setAttribute("value", searchEngine.url);

    lineItem.appendChild(inputName);
    lineItem.appendChild(labelName);
    lineItem.appendChild(inputKeyword);
    lineItem.appendChild(inputMultiTab);
    lineItem.appendChild(inputQueryString);

    lineItem.appendChild(upButton);
    lineItem.appendChild(downButton);
    lineItem.appendChild(removeButton);

    return lineItem;
}

function clearAll() {
    let divSearchEngines = document.getElementById("searchEngines");
    let lineItems = divSearchEngines.childNodes;
    for (i=0;i<lineItems.length;i++) {
        let input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            input.checked = false;
        }
    }
    saveOptions();
}

function selectAll() {
    let divSearchEngines = document.getElementById("searchEngines");
    let lineItems = divSearchEngines.childNodes;
    for (i=0;i<lineItems.length;i++) {
        let input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            input.checked = true;
        }
    }
    saveOptions();
}

function reset() {
    sendMessage("reset", "");
}

function swapIndexes(previousItem, nextItem) {
    // Initialise variables
    let firstObj = null;
    let secondObj = null;
    let tmp = null;
    let newObj = {};

    browser.storage.sync.get([previousItem, nextItem]).then(function(data){
        firstObj = data[previousItem];
        secondObj = data[nextItem];
        tmp = firstObj["index"];
        firstObj["index"] = secondObj["index"];
        secondObj["index"] = tmp;
        newObj[previousItem] = firstObj;
        newObj[nextItem] = secondObj;
    }, onError).then(function(){
        sendMessage("saveEngines", newObj);
    }, onError);
}

function moveSearchEngineUp(e) {
    let lineItem = e.target.parentNode;
    let ps = lineItem.previousSibling;
    let pn = lineItem.parentNode;

    pn.removeChild(lineItem);
    pn.insertBefore(lineItem, ps);

    // Update indexes in sync storage
    swapIndexes(ps.getAttribute("id"), lineItem.getAttribute("id"));

}

function moveSearchEngineDown(e) {
    let lineItem = e.target.parentNode;
    let ns = lineItem.nextSibling;
    let pn = lineItem.parentNode;

    pn.removeChild(ns);
    pn.insertBefore(ns, lineItem);

    // Update indexes in sync storage
    swapIndexes(lineItem.getAttribute("id"), ns.getAttribute("id"));

}

function removeSearchEngine(e) {
    let lineItem = e.target.parentNode;
    let id = lineItem.getAttribute("id");
    let pn = lineItem.parentNode;
        
    pn.removeChild(lineItem);
    browser.storage.sync.remove(id).then(saveOptions, onError);
}

function readData() {
    let oldSearchEngines = {};
    oldSearchEngines = searchEngines;
    searchEngines = {};

    let divSearchEngines = document.getElementById("searchEngines");
    let lineItems = divSearchEngines.childNodes;
    storageSyncCount = lineItems.length;
    for (let i = 0;i < storageSyncCount;i++) {
        let input = lineItems[i].firstChild;
        if (input != null && input.nodeName === "INPUT" && input.getAttribute("type") === "checkbox") {
            let label = input.nextSibling;
            let keyword = label.nextSibling;
            let multiTab = keyword.nextSibling;
            let url = multiTab.nextSibling;
            searchEngines[lineItems[i].id] = {};
            searchEngines[lineItems[i].id]["index"] = i;
            searchEngines[lineItems[i].id]["name"] = label.textContent;
            searchEngines[lineItems[i].id]["keyword"] = keyword.value;
            searchEngines[lineItems[i].id]["multitab"] = multiTab.checked;
            searchEngines[lineItems[i].id]["url"] = url.value;
            searchEngines[lineItems[i].id]["show"] = input.checked;
            searchEngines[lineItems[i].id]["base64"] = oldSearchEngines[lineItems[i].id].base64;
        }
    }
    return sortByIndex(searchEngines);
}

// Save the list of search engines to be displayed in the context menu
function saveOptions() {
    let newSearchEngines = readData();
    sendMessage("saveEngines", newSearchEngines);
}

function testSearchEngine() {
	sendMessage("testSearchEngine", { url: document.getElementById("url").value });
}

function addSearchEngine() {
    let id = name.value.replace(" ", "-").toLowerCase();
    let divSearchEngines = document.getElementById("searchEngines");
    let strUrl = url.value;
    let testUrl = "";
    let newSearchEngine = {};

    // Make certain that query string url starts with "https" to enforce SSL
    if (!strUrl.startsWith("https://")) {
        if (strUrl.startsWith("http://")) {
            strUrl.replace("http://", "https://");
        } else {
            strUrl += "https://" + strUrl;
        }
    }

    // Create test url
    if (strUrl.includes("{searchTerms}")) {
        testUrl = strUrl.replace("{searchTerms}", "test");
    } else if (strUrl.includes("%s")) {
        testUrl = strUrl.replace("%s", "test");
    } else {
        testUrl = strUrl + "test";
    }

    // Validate query string url
    if (url.validity.typeMismatch || !isValidUrl(testUrl)) {
        notify(notifyUrlNotValid);
        return;
    }
    
    newSearchEngine[id] = {"index": storageSyncCount, "name": name.value, "keyword": keyword.value, "multitab": multitab.checked , "url": url.value, "show": show.checked};
    
    let lineItem = createLineItem(id, newSearchEngine[id]);
    divSearchEngines.appendChild(lineItem);
    browser.storage.sync.set(newSearchEngine).then(function() {
        sendMessage("addNewSearchEngine", {"id": id, "searchEngine": newSearchEngine[id]});
        notify(notifySearchEngineAdded);
    }, onError);
    
    // Clear HTML input fields to add a search engine
    clear();
}

function clear() {
    // Clear check boxes and text box entries
    show.checked = true;
    name.value = null;
    keyword.value = null;
    multitab.checked = false;
    url.value = null;
}

function onGot(data) {
    switch (data.tabMode) {
        case "openNewTab":
            openNewTab.checked = true;
            active.style.visibility = "visible";
            break;
        case "sameTab":
            sameTab.checked = true;
            active.style.visibility = "hidden";
            break;
        case "openNewWindow":
            openNewWindow.checked = true;
            active.style.visibility = "visible";
            break;
        default:
            openNewTab.checked = true;
            active.style.visibility = "visible";
            break;
    }

    if (data.tabActive === true) {
        tabActive.checked = true;
    } else { // Default value for tabActive is false
        tabActive.checked = false;
    }

    if (data.gridMode === true) {
        gridMode.checked = true;
    } else { // Default value for gridMode is false
        gridMode.checked = false;
    }

    if (data.optionsMenuLocation === "top" || data.optionsMenuLocation === "bottom" || data.optionsMenuLocation === "none") {
		optionsMenuLocation.value = data.optionsMenuLocation;
    } else {
		// Keep this for users that are upgrading from an older Context Search version and to set a default value when it has not yet been set
        if (data.optionsMenuAtTop === true) {
			optionsMenuLocation.value = "top";
		} else {
			// Default value for optionsMenuLocation is bottom
			optionsMenuLocation.value = "bottom";
		}
    }

    if (data.favicons === false) {
        getFavicons.checked = false;
    } else {
        // Default setting is to fetch favicons for context menu list
        getFavicons.checked = true;
    } 
    
}

// Restore the list of search engines to be displayed in the context menu from the local storage
function restoreOptions() {
    browser.storage.sync.get(null).then(listSearchEngines);
    browser.storage.local.get(["tabMode", "tabActive", "gridMode", "optionsMenuAtTop", "optionsMenuLocation", "favicons"]).then(onGot, onError);
}

function removeHyperlink(event) {
    document.body.removeChild(event.target);
}

function saveToLocalDisk() {
    browser.storage.sync.get().then(downloadSearchEngines, onError);
}

function downloadSearchEngines(searchEngines) {
    saveOptions();
    let fileToDownload = new File([JSON.stringify(searchEngines, null, 2)], {
        type: "text/json",
        name: "searchEngines.json"
    });
    let a = document.createElement("a");
    a.style.display = "none";
    a.download = "searchEngines.json";
    a.href = window.URL.createObjectURL(fileToDownload);
    a.onclick = removeHyperlink;
    document.body.appendChild(a);
    a.click();
}

function handleFileUpload() {
    browser.storage.sync.clear().then(function() {
        let upload = document.getElementById("upload");
        let jsonFile = upload.files[0];
        let reader = new FileReader();
        reader.onload = function(event) {
            searchEngines = JSON.parse(event.target.result);
            listSearchEngines(searchEngines);
            saveOptions();
        };
        reader.readAsText(jsonFile);
    }, onError);
}

function updateTabMode() {
    if (sameTab.checked) {
        active.style.visibility = "hidden";
    } else {
        active.style.visibility = "visible";
    }

    let data = {};
	data["tabMode"] = document.querySelector('input[name="results"]:checked').value;
	data["tabActive"] = tabActive.checked;
	sendMessage("updateTabMode", data);
}

function updateGetFavicons() {
    let fav = getFavicons.checked;
	sendMessage("updateGetFavicons", {"favicons": fav});
}

function updateOptionsMenuLocation() {
    let omat = optionsMenuLocation.value;
	sendMessage("updateOptionsMenuLocation", {"optionsMenuLocation": omat});
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

function handleMessage(message) {
    if (message.action === "searchEnginesLoaded") {
        listSearchEngines(message.data);
    }
}

function i18n() {
    translateContent("data-i18n", "textContent");
    translateContent("data-i18n-placeholder", "placeholder");
    translateContent("data-i18n-title", "title");
}

function translateContent(attribute, type) {
    let i18nElements = document.querySelectorAll('[' + attribute + ']');

    for (let i in i18nElements) {
        try {
            if (i18nElements[i].getAttribute == null) continue;
            let i18n_attrib = i18nElements[i].getAttribute(attribute);
            let message = browser.i18n.getMessage(i18n_attrib);
            switch (type) {
                case "textContent": 
                    i18nElements[i].textContent = message; 
                    break;
                case "placeholder": 
                    i18nElements[i].placeholder = message; 
                    break;
                case "title": 
                    i18nElements[i].title = message; 
                    break;
                default: 
                    break;
            }
        } catch(ex) {
            console.error("i18n id " + IDS[id] + " not found");
        }
    }
}

i18n();

/// WebExtension event handlers
browser.runtime.onMessage.addListener(handleMessage);

/// Event handlers
getFavicons.addEventListener("click", updateGetFavicons);
tabMode.addEventListener("click", updateTabMode);
tabActive.addEventListener("click", updateTabMode);
optionsMenuLocation.addEventListener("click", updateOptionsMenuLocation);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("selectAll").addEventListener("click", selectAll);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("test").addEventListener("click", testSearchEngine);
document.getElementById("add").addEventListener("click", addSearchEngine);
document.getElementById("clear").addEventListener("click", clear);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFileUpload);
