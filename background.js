var searchEngines = {};
var searchEnginesArray = [];
var selection = "";
var browserVersion = 0;

function onError(error) {
    console.log(`Error: ${error}`)
}

function gotBrowserInfo(info){
    let v = info.version;
    browserVersion = parseInt(v.slice(0, v.search(".") - 1));
}

function buildContextMenu(searchEngine, strId, strTitle, faviconUrl){
    if (searchEngine.show) {
        if (browserVersion > 55){
            browser.contextMenus.create({
                id: strId,
                title: strTitle,
                contexts: ["selection"],
                icons: {
                    18: faviconUrl
                }
            });
        } else {
            browser.contextMenus.create({
                id: strId,
                title: strTitle,
                contexts: ["selection"]
            });
        }
    }
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
                var url = searchEngines[se].url;
                var faviconUrl = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + url;
                searchEnginesArray.push(se);
                buildContextMenu(searchEngines[se], strId, strTitle, faviconUrl);
                index += 1;
            }
        }
    );
}

// Perform search based on selected search engine, i.e. selected context menu item
function processSearch(info, tab){
    var targetUrl = "";
    var id = parseInt(info.menuItemId);
    
    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150 || info.selectionText.length > 150) {
	    selection = info.selectionText;
    }

    targetUrl = searchEngines[searchEnginesArray[id]].url + encodeURIComponent(selection);
    browser.tabs.create({
        url: targetUrl
    });
}

function getSelectedText(selectedText) {
    selection = selectedText;
}

browser.runtime.getBrowserInfo().then(gotBrowserInfo);
browser.storage.onChanged.addListener(updateContextMenu);
browser.contextMenus.onClicked.addListener(processSearch);
browser.runtime.onMessage.addListener(getSelectedText);
updateContextMenu();