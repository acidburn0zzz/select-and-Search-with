/// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");
const divSearchEngines = document.getElementById("searchEngines");
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
const gridMode = document.getElementById("gridMode");
const optionsMenuLocation = document.getElementById("optionsMenuLocation");
const getFavicons = document.getElementById("getFavicons");
let storageSyncCount = 0;

// Translation variables
const move = browser.i18n.getMessage("move");
const up = browser.i18n.getMessage("up");
const down = browser.i18n.getMessage("down");
const remove = browser.i18n.getMessage("remove");
const multiple = browser.i18n.getMessage("multipleSearchEnginesSearch");
const savedPrefs = browser.i18n.getMessage("notifySavedPreferences");
const searchEngineAdded = browser.i18n.getMessage("notifySearchEngineAdded");

// Base64 SVG button images
//const upImage = "PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgYmFzZVByb2ZpbGU9InRpbnkiIGhlaWdodD0iMjRweCIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggZD0iTTEyLDMuMTcyTDUuNTg2LDkuNTg2Yy0wLjc4MSwwLjc4MS0wLjc4MSwyLjA0NywwLDIuODI4czIuMDQ3LDAuNzgxLDIuODI4LDBMMTAsMTAuODI4djcuMjQyYzAsMS4xMDQsMC44OTUsMiwyLDIgIGMxLjEwNCwwLDItMC44OTYsMi0ydi03LjI0MmwxLjU4NiwxLjU4NkMxNS45NzcsMTIuODA1LDE2LjQ4OCwxMywxNywxM3MxLjAyMy0wLjE5NSwxLjQxNC0wLjU4NmMwLjc4MS0wLjc4MSwwLjc4MS0yLjA0NywwLTIuODI4ICBMMTIsMy4xNzJ6Ii8+PC9zdmc+";
//const downImage = "PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgYmFzZVByb2ZpbGU9InRpbnkiIGhlaWdodD0iMjRweCIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggZD0iTTE4LjQxNCwxMC42NTZjLTAuNzgxLTAuNzgxLTIuMDQ3LTAuNzgxLTIuODI4LDBMMTQsMTIuMjQyVjVjMC0xLjEwNS0wLjg5Ni0yLTItMmMtMS4xMDUsMC0yLDAuODk1LTIsMnY3LjI0MmwtMS41ODYtMS41ODYgIGMtMC43ODEtMC43ODEtMi4wNDctMC43ODEtMi44MjgsMHMtMC43ODEsMi4wNDcsMCwyLjgyOEwxMiwxOS44OThsNi40MTQtNi40MTRDMTkuMTk1LDEyLjcwMywxOS4xOTUsMTEuNDM4LDE4LjQxNCwxMC42NTZ6Ii8+PC9zdmc+";
//const removeImage = "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABi0lEQVQ4jZ3UQWjPYRzH8Ve0k4NyGeUoWVIOKAdKNuUwSrk5aOXggKw11hri5uLg4iCHLSelJBsOy2ESKVFqkVKUVnbgsEgzh//n3+9n/X+//fjWt97fns/zeb4936eH+tiCR5hJPsTmFfb8FTvRW8rHWFqWk8s0O6rMDnTY3DT3dTLcgD4c+sfsxfqqLkf+o7uhKjM4URK+KfEXzJXq1yU+Xmd4JKKP6MLv1GfSyRJ+YFXpgP46w70RzaVeSH0Kg+H5rH1PvbvOcGtEC6nnO3T4OWuLqWvfZbfiblbjU/gshsPvsaakW1dn2FUSrsW78CDOKYbVPnhR6z5r41vEGxXTHFI8qefYFP66khl8iLgHz8LDGA0/wfbwbBPDFxHvwnT4PMbCU9gTftrEcDLi/XgQHsGF8F0cDN9rYjgR8WHcCY/iUvg2joZvNTG8FvExjIfHcDl8EwPhq00M29M8iRvhi7gSvo7TGnwM7diGX1rPYzYbXyk+i7d4iZ9aP3qj6NMayExF3lfxqf4B1nmtJThBNE0AAAAASUVORK5CYII=";

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
    if(divSearchEngines != null) divContainer.removeChild(divSearchEngines);

    let searchEngines = sortByIndex(list);
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
    inputName.setAttribute("id", id + "-cbx");
    inputName.checked = searchEngine.show;

    labelName.setAttribute("for", id + "-cbx");
    labelName.appendChild(textName);

    inputKeyword.setAttribute("type", "text");
    inputKeyword.setAttribute("id", id + "-kw");
    inputKeyword.setAttribute("class", "keyword");
    inputKeyword.setAttribute("placeholder", "Keyword");
    inputKeyword.setAttribute("value", searchEngine.keyword);

    inputMultiTab.setAttribute("type", "checkbox");
    inputMultiTab.setAttribute("id", id + "-mt");
    inputMultiTab.setAttribute("title", "Use this search engine in the multitab feature");

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

    //console.log(previousItem);
    //console.log(nextItem);

    browser.storage.sync.get([previousItem, nextItem]).then(function(data){
        //console.log(data);
        firstObj = data[previousItem];
        secondObj = data[nextItem];
        //console.log("firstObj: " + JSON.stringify(firstObj));
        //console.log("secondObj: " + JSON.stringify(secondObj));
        tmp = JSON.parse(JSON.stringify(firstObj["index"])); // creating a new temporary object to avoid passing firstObj by reference
        firstObj["index"] = secondObj["index"];
        secondObj["index"] = tmp;
        //console.log("firstObj: " + JSON.stringify(firstObj));
        //console.log("secondObj: " + JSON.stringify(secondObj));
        newObj[previousItem] = firstObj;
        newObj[nextItem] = secondObj;
        }, onError).then(function(){
            browser.storage.sync.set(newObj).then(null, onError);
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
    let searchEngines = {};

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
        }
    }
    return sortByIndex(searchEngines);
}

// Save the list of search engines to be displayed in the context menu
function save(){
    saveOptions(true);
}

function saveOptions(notification) {
    let searchEngines = readData();
    if (notification == true) {
        browser.storage.sync.set(searchEngines).then(notify("Saved preferences."), onError);
    } else {
        browser.storage.sync.set(searchEngines).then(null, onError);
    }
}

function testSearchEngine() {
	sendMessage("testSearchEngine", { url: document.getElementById("url").value });
}

function addSearchEngine() {

    // Validate url for query string
    strUrl = url.value;
    let testUrl = "";
    if (strUrl.includes("{searchTerms}")) {
        testUrl = strUrl.replace("{searchTerms}", "test");
    } else {
        testUrl = strUrl + "test";
    }
    if (url.validity.typeMismatch || !isValidUrl(testUrl)) {
        notify("Url entered is not valid.");
        return;
    }

    const id = name.value.replace(" ", "-").toLowerCase();
    let newSearchEngine = {};
    newSearchEngine[id] = {"index": storageSyncCount, "name": name.value, "keyword": keyword.value, "multitab": multitab.value , "url": url.value, "show": show.checked};
    let lineItem = createLineItem(id, newSearchEngine[id]);
    divSearchEngines.appendChild(lineItem);
    browser.storage.sync.set(newSearchEngine).then(notify("Search engine added."), onError);

    // Clear HTML input fields to add a search engine
    show.checked = true;
    name.value = null;
    keyword.value = null;
    multitab.checked = false;
    url.value = null;
}

function clear() {
    // Clear check boxes and text box entries
    show.checked = false;
    name.value = "";
    keyword.value = "";
    multitab.checked = false;
    url.value = "";
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
        getFavicons.checked = true;
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
            let searchEngines = JSON.parse(event.target.result);
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
    
    browser.storage.local.set(data);
}

function updateGetFavicons() {
    let fav = getFavicons.checked;
    browser.storage.local.set({"favicons": fav}).then(null, onError);
}

function updateGridMode() {
    let gm = gridMode.checked;
    browser.storage.local.set({"gridMode": gm}).then(null, onError);
}

function updateOptionsMenuLocation() {
    let omat = optionsMenuLocation.value;
    browser.storage.local.set({"optionsMenuLocation": omat}).then(null, onError);
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
    let i18nElements = document.querySelectorAll('[data-i18n]');

    for (let i in i18nElements) {
        try {
            if (i18nElements[i].getAttribute == null) continue;
            let i18n_attrib = i18nElements[i].getAttribute("data-i18n");
            let message = browser.i18n.getMessage(i18n_attrib);
            i18nElements[i].textContent = message;
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
gridMode.addEventListener("click", updateGridMode);
optionsMenuLocation.addEventListener("click", updateOptionsMenuLocation);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("selectAll").addEventListener("click", selectAll);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("test").addEventListener("click", testSearchEngine);
document.getElementById("add").addEventListener("click", addSearchEngine);
document.getElementById("clear").addEventListener("click", clear);
document.getElementById("save").addEventListener("click", save);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFileUpload);
