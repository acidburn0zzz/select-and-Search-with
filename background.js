var searchEngines = {};
var searchEnginesArray = [];
var selection = "";

function onError(error) {
    console.log(`Error: ${error}`)
}

function sortAlphabetically(jsonObj) {
    // Create a new empty object
    var sortedJSON = {};
    // Build an array with ids of search engines and sort the array alphabetically
    var arrayOfIds = Object.keys(jsonObj);
    // For each element in the array, fetch its value and add it to the sorted new object
    var arrayOfNames = [];
    var sortedArrayOfNames = [];
    var tmpObj = {};
    for (let i = 0;i < arrayOfIds.length;i++) {
        arrayOfNames.push(jsonObj[arrayOfIds[i]].name);
        tmpObj[jsonObj[arrayOfIds[i]].name] = arrayOfIds[i];
    }
    var sortedArrayOfNames = arrayOfNames.sort();
    for (let item of sortedArrayOfNames) {
        sortedJSON[tmpObj[item]] = jsonObj[tmpObj[item]];
    }
    return sortedJSON;
}

// Create the context menu using the search engines listed above
function updateContextMenu(changes, area) {
    browser.contextMenus.removeAll();
    browser.storage.sync.get(null).then(
        (data) => {
            searchEngines = sortAlphabetically(data);
            searchEnginesArray = [];
            var index = 0;
            for (var se in searchEngines) {
                var strId = index.toString();
                var strTitle = searchEngines[se].name;
                searchEnginesArray.push(se);
                if (searchEngines[se].show) {
                    browser.contextMenus.create({
                        id: strId,
                        title: strTitle,
                        contexts: ["selection"]
                    });
                }
                index += 1;
            }
        }
    );
}

// Perform search based on selected search engine, i.e. selected context menu item
browser.contextMenus.onClicked.addListener(function(info, tab) {
    var searchString = "";
    var targetUrl = "";
    var id = parseInt(info.menuItemId);
    
    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150){
	selection = info.selectionText;
    }
    if (searchEnginesArray[id] != "linkedin") {
        searchString = selection.replace(/ /g, "+");
    }
    targetUrl = searchEngines[searchEnginesArray[id]].url + searchString;
    browser.tabs.create({
        url: targetUrl
    });
});

function getSelectedText(selectedText) {
    selection = selectedText;
}

updateContextMenu();
browser.storage.onChanged.addListener(updateContextMenu);
browser.runtime.onMessage.addListener(getSelectedText);
