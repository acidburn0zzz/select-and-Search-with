var searchEngines = {};
var searchEnginesArray = [];
var selection = "";

function onError(error) {
    console.log(`Error: ${error}`)
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
    var targetUrl = "";
    var id = parseInt(info.menuItemId);
    
    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150) {
	    selection = info.selectionText;
    }

    targetUrl = searchEngines[searchEnginesArray[id]].url + encodeURIComponent(selection);
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
