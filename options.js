/// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");
const openNewTab = document.getElementById("openNewTab");
const openNewWindow = document.getElementById("openNewWindow");
const sameTab = document.getElementById("sameTab");
const tabMode = document.getElementById("tabMode");
const tabActive = document.getElementById("tabActive");
const active = document.getElementById("active");
let storageSyncCount = 0;
let os = "-";

/// Identify Operating System
function identifyOS() {
    os = navigator.platform;
    console.log(os);
}

// Sending messages to the background script
function sendMessage(action, data){
    browser.runtime.sendMessage({"action": action, "data": data});
}

function notify(message){
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

    //notify("Saved search engines have been restored."); Annoying as hell
}

function createButton(btnLabel, btnClass, btnTitle) {
    let button = document.createElement("button");
    let btnText = document.createTextNode(btnLabel)
    button.setAttribute("type", "button");
    button.setAttribute("class", btnClass);
    button.setAttribute("title", btnTitle);
    button.appendChild(btnText);
    return button;
}

function createLineItem(id, searchEngine) {
    let lineItem = document.createElement("li");

    let inputName = document.createElement("input");
    let labelName = document.createElement("label");
    let textName = document.createTextNode(searchEngine.name);

    let inputKeyword = document.createElement("input");
    
    let inputQueryString = document.createElement("input");

    let upButton = createButton("↑", "up", "Move " + searchEngine.name + " up");
    let downButton = createButton("↓", "down", "Move " + searchEngine.name + " down");
    let removeButton = createButton("Remove", "remove", "Remove " + searchEngine.name);
    upButton.addEventListener("click", upEventHandler, false);
    downButton.addEventListener("click", downEventHandler, false);
    removeButton.addEventListener("click", removeEventHandler, false);

    lineItem.setAttribute("id", id);

    inputName.setAttribute("type", "checkbox");
    inputName.setAttribute("id", id + "-cbx");
    inputName.checked = searchEngine.show;

    labelName.setAttribute("for", id + "-cbx");
    labelName.appendChild(textName);

    inputQueryString.setAttribute("type", "url");
    inputQueryString.setAttribute("value", searchEngine.url);

    inputKeyword.setAttribute("type", "text");
    inputKeyword.setAttribute("id", id + "-kw");
    inputKeyword.setAttribute("class", "keyword");
    inputKeyword.setAttribute("placeholder", "Keyword");
    inputKeyword.setAttribute("value", searchEngine.keyword);

    lineItem.appendChild(inputName);
    lineItem.appendChild(labelName);
    lineItem.appendChild(inputKeyword);
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
            let url = keyword.nextSibling;
            searchEngines[lineItems[i].id] = {};
            searchEngines[lineItems[i].id]["index"] = i;
            searchEngines[lineItems[i].id]["name"] = label.textContent;
            searchEngines[lineItems[i].id]["keyword"] = keyword.value;
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

function addSearchEngine() {
    const divSearchEngines = document.getElementById("searchEngines");
    const show = document.getElementById("show"); // Boolean
    const name = document.getElementById("name"); // String
    const keyword = document.getElementById("keyword"); // String
    const url = document.getElementById("url"); // String

    strUrl = url.value;
    let testUrl = "";
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
    let newSearchEngine = {};
    newSearchEngine[id] = {"index": storageSyncCount, "name": name.value, "keyword": keyword.value, "url": url.value, "show": show.checked};
    let lineItem = createLineItem(id, newSearchEngine[id]);
    divSearchEngines.appendChild(lineItem);
    browser.storage.sync.set(newSearchEngine).then(notify("Search engine added."), onError);

    // Clear HTML input fields to add a search engine
    show.checked = true;
    name.value = null;
    keyword.value = null;
    url.value = null;
}

function onHas(data) {
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
            break;
    }
    tabActive.checked = data.tabActive;
}

// Restore the list of search engines to be displayed in the context menu from the local storage
function restoreOptions() {
    browser.storage.sync.get(null).then(listSearchEngines);
    browser.storage.local.get(["tabMode", "tabActive"]).then(onHas, onError);
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

identifyOS();

browser.runtime.onMessage.addListener(handleMessage);
tabMode.addEventListener("click", updateTabMode);
tabActive.addEventListener("click", updateTabMode);
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("selectAll").addEventListener("click", selectAll);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("add").addEventListener("click", addSearchEngine);
document.getElementById("save").addEventListener("click", save);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFileUpload);
