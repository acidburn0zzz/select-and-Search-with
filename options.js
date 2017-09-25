// Global variables
const divContainer = document.getElementById("container");
const divAddSearchEngine = document.getElementById("addSearchEngine");
const tabActive = document.getElementById("tabActive");
var storageSyncCount = 0;

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
    var i = 0;
    for (let se in searchEngines) {
        var lineItem = document.createElement("li");
        var labelSE = document.createElement("label");
        var inputSE = document.createElement("input");
        var inputQS = document.createElement("input");
        var textSE = document.createTextNode(searchEngines[se].name);
        if (Object.keys(searchEngines).length > 1) {
            var upButton = document.createElement("button");
            var textUpButton = document.createTextNode("↑");
            upButton.setAttribute("type", "button");
            upButton.setAttribute("class", "up");
            upButton.appendChild(textUpButton);
            var downButton = document.createElement("button");
            var textDownButton = document.createTextNode("↓");
            downButton.setAttribute("type", "button");
            downButton.setAttribute("class", "down");
            downButton.appendChild(textDownButton);
            var removeButton = document.createElement("button");
            var textRemoveButton = document.createTextNode("Remove");
            removeButton.setAttribute("type", "button");
            removeButton.setAttribute("class", "remove");
            removeButton.appendChild(textRemoveButton);
            lineItem.setAttribute("id", se);
            if (i === 0) {
                lineItem.setAttribute("class", "top");
            } else if (i === Object.keys(searchEngines).length - 1) {
                lineItem.setAttribute("class", "bottom");
            }
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
            if (i > 0) {
              upButton.addEventListener("click", upEventHandler, false);
              lineItem.appendChild(upButton);
            }
            if (i < Object.keys(searchEngines).length - 1) {
              downButton.addEventListener("click", downEventHandler, false);
              lineItem.appendChild(downButton);
            }
            removeButton.addEventListener("click", removeEventHandler, false);
            lineItem.appendChild(removeButton);
        } else {
            lineItem.setAttribute("id", se);
            if (i === 0) {
                lineItem.setAttribute("class", "top");
            } else if (i === Object.keys(searchEngines).length - 1) {
                lineItem.setAttribute("class", "bottom");
            }
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
        i++;
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
  if (e.target.type === "button" && e.target.className === "up") {
      var lineItem = e.target.parentNode;
      var ps = lineItem.previousSibling;
      var pn = lineItem.parentNode;
      pn.removeChild(lineItem);
      if (ps.className === "top" && lineItem.className === "bottom") {
          // 1. Remove up button from lineItem and its associated click event listener
          var liUpButton = lineItem.lastChild.previousSibling;
          liUpButton.removeEventListener("click", upEventHandler, false);
          lineItem.removeChild(liUpButton);
          liUpButton = null;

          // 2. Remove down button from ps and its associated click event listener
          var psDownButton = ps.lastChild.previousSibling;
          psDownButton.removeEventListener("click", downEventHandler, false);
          ps.removeChild(psDownButton);
          psDownButton = null;

          // 3. Add down button to lineItem and its associated click event listener
          var downButton = document.createElement("button");
          var textDownButton = document.createTextNode("↓");
          downButton.setAttribute("type", "button");
          downButton.setAttribute("class", "down");
          downButton.appendChild(textDownButton);
          downButton.addEventListener("click", downEventHandler, false);
          lineItem.insertBefore(downButton, lineItem.lastChild);

          // 4. Add up button to ps and its associated click event listener
          var upButton = document.createElement("button");
          var textUpButton = document.createTextNode("↑");
          upButton.setAttribute("type", "button");
          upButton.setAttribute("class", "up");
          upButton.appendChild(textUpButton);
          upButton.addEventListener("click", upEventHandler, false);
          ps.insertBefore(upButton, ps.lastChild);

          // 5. Remove class "bottom" from lineItem and add class "top" to lineItem
          lineItem.removeAttribute("class");
          lineItem.setAttribute("class", "top");
          
          // 6. Remove class "top" from ps and add class "bottom" to ps
          ps.removeAttribute("class");
          ps.setAttribute("class", "bottom");

      } else if (ps.className === "top") {
          // 1. Add an up button in ps and its associated click event listener
          var upButton = document.createElement("button");
          var textUpButton = document.createTextNode("↑");
          upButton.setAttribute("type", "button");
          upButton.setAttribute("class", "up");
          upButton.appendChild(textUpButton);
          upButton.addEventListener("click", upEventHandler, false);
          ps.insertBefore(upButton, ps.lastChild.previousSibling);

          // 2. Remove the class "top" from ps
          ps.removeAttribute("class");

          // 3. Remove the up button in lineItem and remove its event listener
          var liUpButton = lineItem.lastChild.previousSibling.previousSibling;
          liUpButton.removeEventListener("click", upEventHandler, false);
          lineItem.removeChild(liUpButton);
          liUpButton = null;

          // 4. Add the class "top" to lineItem
          lineItem.setAttribute("class", "top");

      } else if (lineItem.className === "bottom") {
          // 1. Add a down button in lineItem and its associated click event listener
          var downButton = document.createElement("button");
          var textDownButton = document.createTextNode("↓");
          downButton.setAttribute("type", "button");
          downButton.setAttribute("class", "down");
          downButton.appendChild(textDownButton);
          downButton.addEventListener("click", downEventHandler, false);
          lineItem.insertBefore(downButton, lineItem.lastChild);

          // 2. Remove class "bottom" from lineItem
          lineItem.removeAttribute("class");

          // 3. Remove the down button in ps and its click event listener
          var psDownButton = ps.lastChild.previousSibling;
          psDownButton.removeEventListener("click", downEventHandler, false);
          ps.removeChild(psDownButton);
          psDownButton = null;

          // 4. Add class "bottom" to ps
          ps.setAttribute("class", "bottom");

      }
      pn.insertBefore(lineItem, ps);
      browser.storage.sync.clear().then(saveOptions, onError);
  }
}

function moveSearchEngineDown(e) {
  if (e.target.type === "button" && e.target.className === "down") {
      var lineItem = e.target.parentNode;
      var ns = lineItem.nextSibling;
      var pn = lineItem.parentNode;
      pn.removeChild(ns);
      if (lineItem.className === "top" && lineItem.nextSibling.className === "bottom") {
        
        // 1. Remove class "top" from lineItem
        lineItem.removeAttribute("class");

        // 2. Remove class "bottom" from ns
        ns.removeAttribute("class");

        // 3. Add class "top" to ns
        ns.setAttribute("class", "top");

        // 4. Add class "bottom" to lineItem
        lineItem.setAttribute("class", "bottom");

        // 5. Remove down buttom from lineItem and its associated click event listener
        var liDownButton = lineItem.lastChild.previousSibling;
        liDownButton.removeEventListener("click", downEventHandler, false);
        lineItem.removeChild(liDownButton);
        liDownButton = null;

        // 6. Add up button to lineItem and its associated click event listener
        var upButton = document.createElement("button");
        var textUpButton = document.createTextNode("↑");
        upButton.setAttribute("type", "button");
        upButton.setAttribute("class", "up");
        upButton.appendChild(textUpButton);
        upButton.addEventListener("click", upEventHandler, false);
        lineItem.insertBefore(upButton, lineItem.lastChild);

        // 7. Remove up button from ns and its associated click event listener
        var nsUpButton = ns.lastChild.previousSibling;
        nsUpButton.removeEventListener("click", upEventHandler, false);
        ns.removeChild(nsUpButton);
        nsUpButton = null;

        // 8. Add down button to ns and its associated click event listener
        var downButton = document.createElement("button");
        var textDownButton = document.createTextNode("↓");
        downButton.setAttribute("type", "button");
        downButton.setAttribute("class", "down");
        downButton.appendChild(textDownButton);
        downButton.addEventListener("click", downEventHandler, false);
        ns.insertBefore(downButton, ns.lastChild);

      } else if (lineItem.className === "top") {

        // 1. Add up button to lineItem with its associated click event listener
        var upButton = document.createElement("button");
        var textUpButton = document.createTextNode("↑");
        upButton.setAttribute("type", "button");
        upButton.setAttribute("class", "up");
        upButton.appendChild(textUpButton);
        upButton.addEventListener("click", upEventHandler, false);
        lineItem.insertBefore(upButton, lineItem.lastChild.previousSibling);

        // 2. Remove class "top" from lineItem
        lineItem.removeAttribute("class");

        // 3. Remove up button from ns and its associated click event listener
        var nsUpButton = ns.lastChild.previousSibling.previousSibling;
        nsUpButton.removeEventListener("click", upEventHandler, false);
        ns.removeChild(nsUpButton);
        nsUpButton = null;
        
        // 4. Add class "top" to ns
        ns.setAttribute("class", "top");

      } else if (ns.className === "bottom") {

        // 1. Remove down button from lineItem and its associated click event listener
        var liDownButton = lineItem.lastChild.previousSibling;
        liDownButton.removeEventListener("click", downEventHandler, false);
        lineItem.removeChild(liDownButton);
        liDownButton = null;

        // 2. Remove class "bottom" from ns
        ns.removeAttribute("class");

        // 3. Add down button to ns and its associated click event listener
        var downButton = document.createElement("button");
        var textDownButton = document.createTextNode("↓");
        downButton.setAttribute("type", "button");
        downButton.setAttribute("class", "down");
        downButton.appendChild(textDownButton);
        downButton.addEventListener("click", downEventHandler, false);
        ns.insertBefore(downButton, ns.lastChild);

        // 4. Add class "bottom" to lineItem
        lineItem.setAttribute("class", "bottom");

      }
      pn.insertBefore(ns, lineItem);
      browser.storage.sync.clear().then(saveOptions, onError);
  }
}

function removeSearchEngine(e) {
    if (e.target.type === "button" && e.target.className === "remove") {
        var lineItem = e.target.parentNode;
        
        if (lineItem.className === "top" && lineItem.nextSibling.className === "bottom") { // If there are only 2 search engines
            var ns = lineItem.nextSibling;

            // 1. Remove class "bottom" from next sibling
            ns.removeAttribute("class");

            // 2. Remove up, down and remove buttons from next sibling and its associated click event listeners
            ns.removeChild(ns.lastChild); // Remove button
            ns.removeChild(ns.lastChild); // Down button
            ns.removeChild(ns.lastChild); // Up button

        } else if (lineItem.className === "bottom" && lineItem.previousSibling === "top") { // If there are only 2 search engines
            var ps = lineItem.previousSibling;

            // 1. Remove class "top" from previous sibling
            ps.removeAttribute("class");

            // 2. Remove up, down and remove buttons from the previous sibling
            ps.removeChild(ps.lastChild); // Remove button
            ps.removeChild(ps.lastChild); // Down button
            ps.removeChild(ps.lastChild); // Up button

        } else if (lineItem.className === "top") {
            var ns = lineItem.nextSibling;

            // 1. Set class of next sibling to "top"
            ns.className = "top";

            // 2. Remove up button from next sibling and its associated click event listener
            var nsUpButton = ns.lastChild.previousSibling.previousSibling;
            nsUpButton.removeEventListener("click", upEventHandler, false);
            ns.removeChild(nsUpButton);
            nsUpButton = null;

        } else if (lineItem.className === "bottom") {
            // 1. Set class of previous sibling to "bottom"
            var ps = lineItem.previousSibling;
            ps.className = "bottom";

            // 2. Remove down button from previous sibling and its associated click event listener
            var psDownButton = ps.lastChild.previousSibling;
            psDownButton.removeEventListener("click", downEventHandler, false);
            ps.removeChild(psDownButton);
            psDownButton = null;

        }
        lineItem.parentNode.removeChild(lineItem);
        browser.storage.sync.clear().then(saveOptions, onError);
    }
}

function readData() {
    var divSearchEngines = document.getElementById("searchEngines");
    var options = {};
    var lineItems = divSearchEngines.childNodes;
    storageSyncCount = lineItems.length;
    for (var i = 0;i < storageSyncCount;i++) {
        var input = lineItems[i].firstChild;
        if (input != null && input.nodeName == "INPUT" && input.getAttribute("type") == "checkbox") {
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
function saveOptions() {
    var options = readData();
    browser.storage.sync.set(options).then(null, onError);
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
    var testUrl = "";
    if (url.includes("{search terms}")) {
        testUrl = url.replace("{search terms}", "google");
    } else {
        testUrl = url + "google";
    }
    if (url.validity.typeMismatch || !isValidUrl(testUrl)) {
        alert("Url entered is not valid.");
        return;
    }
    const id = name.value.replace(" ", "-").toLowerCase();
    var newSearchEngine = {};
    newSearchEngine[id] = {"index": storageSyncCount, "name": name.value, "url": url.value, "show": show.checked};
    browser.storage.sync.set(newSearchEngine).then(onAdded, onError);
}

function onGot(searchEngines) {
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

function isValidUrl(url)
{
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
document.getElementById("save").addEventListener("click", saveOptions);
document.getElementById("download").addEventListener("click", saveToLocalDisk);
document.getElementById("upload").addEventListener("change", handleFileUpload);
