// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");

// Generic Error Handler
function onError(error) {
  console.log(`Error: ${error}`);
}

// Load list of search engines
function loadSearchEngines(jsonFile) {
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open("GET", jsonFile, true);
    ajaxRequest.setRequestHeader("Content-type", "application/json");
    ajaxRequest.overrideMimeType("application/json");
    ajaxRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var searchEngines = JSON.parse(this.responseText);
            generateHTML(searchEngines);
            saveOptions();
        }
    };
    ajaxRequest.send();
}

function generateHTML(list) {
    var searchEngines = sortAlphabetically(list);
    var divSearchEngines = document.createElement("ol");
    divSearchEngines.setAttribute("id", "searchEngines");
    for (let se in searchEngines) {
        var lineItem = document.createElement("li");
        var labelSE = document.createElement("label");
        var inputSE = document.createElement("input");
        var inputQS = document.createElement("input");
        var removeButton = document.createElement("button");
        var textSE = document.createTextNode(searchEngines[se].name);
        var textButton = document.createTextNode("Remove");
        lineItem.setAttribute("id", se);
        labelSE.setAttribute("for", se + "-cbx");
        labelSE.appendChild(textSE);
        inputSE.setAttribute("type", "checkbox");
        inputSE.setAttribute("id", se + "-cbx");
        inputSE.checked = searchEngines[se].show;
        removeButton.setAttribute("type", "button");
        removeButton.appendChild(textButton);
        inputQS.setAttribute("type", "url");
        inputQS.setAttribute("value", searchEngines[se].url);
        lineItem.appendChild(inputSE);
        lineItem.appendChild(labelSE);
        lineItem.appendChild(inputQS);
        lineItem.appendChild(removeButton);
        divSearchEngines.appendChild(lineItem);
        removeButton.addEventListener("click", function(e) {
            e.stopPropagation();
            removeSearchEngine(e);
        }, false);
    }
    divContainer.appendChild(divSearchEngines);
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
    var clearStorage = browser.storage.sync.clear();
    clearStorage.then(loadSearchEngines("defaultSearchEngines.json"), onError);
}

function onRemoved() {
    //
}

function removeSearchEngine(e) {
    if (e.target.type == "button") {
        var lineItem = e.target.parentNode;
        lineItem.parentNode.removeChild(lineItem);
        let removeItem = browser.storage.sync.remove(lineItem.id);
        removeItem.then(onRemoved, onError);
    }
}

function readData() {
    var divSearchEngines = document.getElementById("searchEngines");
    var options = {};
    var lineItems = divSearchEngines.childNodes;
    for (i=0;i<lineItems.length;i++) {
        var input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
            var label = input.nextSibling;
            var url = label.nextSibling;
            options[lineItems[i].id] = {};
            options[lineItems[i].id]["name"] = label.textContent;
            options[lineItems[i].id]["url"] = url.value;
            options[lineItems[i].id]["show"] = input.checked;
        }
    }
    return options;
}

// Save the list of search engines to be displayed in the context menu
function saveOptions() {
    var options = readData();
    var sortedOptions = sortAlphabetically(options);
    browser.storage.sync.set(sortedOptions).then(null, onError);
}

function onAdded() {
    // Clear HTML input fields to add a search engine
    show.checked = false;
    name.value = "";
    url.value = "";
    restoreOptions();
}

function addSearchEngine() {
    const show = document.getElementById("show"); // Boolean
    const name = document.getElementById("name"); // String
    const url = document.getElementById("url"); // String
    if (url.validity.typeMismatch) {
        return;
    }
    const id = name.value.replace(" ", "-").toLowerCase();
    var newSearchEngine = {};
    newSearchEngine[id] = {"name": name.value, "url": url.value, "show": show.checked};
    browser.storage.sync.set(newSearchEngine).then(onAdded, onError);
}

function onGot(searchEngines) {
    if (Object.keys(searchEngines).length > 0) {
        generateHTML(sortAlphabetically(searchEngines));
        console.log("Saved search engines have been loaded.");
    } else {
        var clearStorage = browser.storage.sync.clear();
        clearStorage.then(loadSearchEngines("defaultSearchEngines.json"), onError);
        console.log("Default search engines have been loaded.");
    }
}

// Restore the list of search engines to be displayed in the context menu from the local storage
function restoreOptions() {
    console.log("Loading search engines...");
    let gettingSearchEngines = browser.storage.sync.get(null);
    gettingSearchEngines.then(onGot, onError);
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
    var fileToDownload = new File([JSON.stringify(searchEngines)], {
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

function handleFile() {
    var divSearchEngines = document.getElementById("searchEngines");
    divContainer.removeChild(divSearchEngines);
    var clearStorage = browser.storage.sync.clear();
    clearStorage.then(function() {
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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("selectAll").addEventListener("click", selectAll);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("add").addEventListener("click", addSearchEngine);
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFile);