var searchEngines = {};
var searchEnginesArray = [];
var selection = "";
var targetUrl = "";
var browserVersion = 0;
var openTabInForeground = true;

function onError(error) {
    console.log(`Error: ${error}`)
}

function gotBrowserInfo(info){
    let v = info.version;
    browserVersion = parseInt(v.slice(0, v.search(".") - 1));
}

function buildContextMenu(searchEngine, strId, strTitle, faviconUrl){
    browser.contextMenus.create({
        id: "999",
        title: "Search this site with Google",
        contexts: ["selection"]
    });
    browser.contextMenus.create({
        id: "1001",
        type: "separator",
        contexts: ["selection"]
      });
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
function onStorageChanges(changes, area) {
    if (area === "local") {
        var changedItems = Object.keys(changes);
        for (var item of changedItems) {
            if (item === "tabActive") {
                openTabInForeground = changes[item].newValue;
                break;
            }
        }
    } else {
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
}

// Perform search based on selected search engine, i.e. selected context menu item
function processSearch(info, tab){
    var id = parseInt(info.menuItemId);
    
    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150 || info.selectionText.length > 150) {
	    selection = info.selectionText;
    }

    if (id < 999) {
        targetUrl = searchEngines[searchEnginesArray[id]].url + encodeURIComponent(selection);
        openTab(targetUrl);
        targetUrl = "";
    } else if (id === 999) {
        if (targetUrl != "") openTab(targetUrl);
        targetUrl = "";
    } else {
        return
    }
}

function openTab(targetUrl) {
    browser.tabs.create({
        active: openTabInForeground,
        url: targetUrl
    });
}

function getMessage(message) {
    if (message.selection) selection = message.selection;
    if (message.targetUrl) targetUrl = message.targetUrl
}

browser.runtime.getBrowserInfo().then(gotBrowserInfo);
browser.storage.onChanged.addListener(onStorageChanges);
browser.contextMenus.onClicked.addListener(processSearch);
browser.runtime.onMessage.addListener(getMessage);
onStorageChanges();