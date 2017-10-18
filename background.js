/// Global variables
var searchEngines = {};
var searchEnginesArray = [];
var selection = "";
var targetUrl = "";
var gridMode = false;
var lastAddressBarKeyword = "";

/// Constants
const DEFAULT_JSON = "defaultSearchEngines.json";
const AWS_API = "API URL GOES HERE";
const AWS_API_KEY = "API KEY GOES HERE";

/// Browser specifics
let reset = false;
let browserVersion = 45;

/// Preferences
let optionsMenuAtTop = false;
let contextsearch_openSearchResultsInNewTab = true;
let contextsearch_makeNewTabOrWindowActive = false;
let contextsearch_openSearchResultsInNewWindow = false;

/// Handle Incoming Messages
// Listen for messages from the content or options script
browser.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "doSearch":
            searchUsing(message.data); // message.data will contain search engine id
            break;
        case "notify":
            notify(message.data);
            break;
        case "getSelectionText":
            if (message.data) selection = message.data;
            break;
        case "sendCurrentTabUrl":
            if (message.data) targetUrl = message.data;
            break;
        case "reset":
            reset = true;
            loadSearchEngines(DEFAULT_JSON);
            break;
        default:
            break;
    }
});

/// Initialisation
function init() {
	detectStorageSupportAndLoadSearchEngines();
    browser.runtime.getBrowserInfo().then(gotBrowserInfo);
    browser.storage.onChanged.addListener(onStorageChanges);

    browser.storage.local.get(["tabMode", "tabActive"]).then(fetchTabMode, onError);
    browser.storage.local.get("gridMode").then(setGridModeAndBuildContextMenu, onError);
    browser.storage.local.get("optionsMenuAtTop").then(setOptionsMenu, onError);

    // getBrowserInfo
    function gotBrowserInfo(info){
        let v = info.version;
        browserVersion = parseInt(v.slice(0, v.search(".") - 1));
    }
}

// Store the default values for tab mode in storage local
function fetchTabMode(data) {
    if (Object.keys(data).length > 0 && data.tabMode !== null && data.tabActive !== null) {
        setTabMode(data);
    } else {
        let data = {};
        data["tabMode"] = "openNewTab";
        data["tabActive"] = false;
        browser.storage.local.set(data);
        setTabMode(data);
    }
}

/// Tab Mode
function setTabMode(data) {
    contextsearch_makeNewTabOrWindowActive = data.tabActive;
    switch (data.tabMode) {
        case "openNewTab":
            contextsearch_openSearchResultsInNewTab = true;
            contextsearch_openSearchResultsInNewWindow = false;
            break;
        case "sameTab":
            contextsearch_openSearchResultsInNewTab = false;
            contextsearch_openSearchResultsInNewWindow = false;
            break;
        case "openNewWindow":
            contextsearch_openSearchResultsInNewWindow = true;
            contextsearch_openSearchResultsInNewTab = false;
            break;
        default:
            break;
    }
}

function setGridModeAndBuildContextMenu(data) {
    if (data.gridMode === true || data.gridMode === false) {
        gridMode = data.gridMode;
        rebuildContextMenu();
    } else {
        // Set default value for gridMode to false if it is not set to true or false
        gridMode = false;
        browser.storage.local.set({"gridMode": false}).then(null, onError);
    }
}

// To support Firefox ESR, we should check whether browser.storage.sync is supported and enabled.
function detectStorageSupportAndLoadSearchEngines() {
	browser.storage.sync.get(null).then(onGot, onNone);

    // Load search engines if they're not already loaded in storage sync
	function onGot(data){
        if (!Object.keys(data).length > 0 || reset) {
            // Storage sync is empty -> load default list of search engines
            loadSearchEngines(DEFAULT_JSON);
        } else {
            searchEngines = sortByIndex(data);
            initializeFavicons();
        }
	}

	function onNone(error){
        loadSearchEngines(DEFAULT_JSON);
		if (error.toString().indexOf("Please set webextensions.storage.sync.enabled to true in about:config") > -1) {
			notify("Please enable storage sync by setting webextensions.storage.sync.enabled to true in about:config. Context Search will not work until you do so.");
		} else {
            onError(error);
        }
	}
}

/// Load default list of search engines
function loadSearchEngines(jsonFile) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", jsonFile, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.overrideMimeType("application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            notify("Default list of search engines has been loaded.");
            searchEngines = JSON.parse(this.responseText);
            // Fetch missing favicon urls and generate corresponding base 64 images
            initializeFavicons();
            browser.storage.sync.set(searchEngines).then(function() {
                if (reset) {
                    browser.runtime.sendMessage({"action": "searchEnginesLoaded", "data": searchEngines}).then(null, onError);
                    reset = false;
                }
            }, onError);
        }
    };
    xhr.send();
}

/// Get and store favicon urls and base 64 images
function initializeFavicons() {
    for (let id in searchEngines) {
        let faviconUrl = "";
        let base64ImageString = "";
        if (searchEngines[id].faviconUrl === undefined || searchEngines[id].faviconUrl.length <= 0) {
            let url = searchEngines[id].url;
            let urlParts = url.replace('http://','').replace('https://','').split(/\//);
            let domain = urlParts[0];
            faviconUrl = getFaviconUrl(domain);
            searchEngines[id]["faviconUrl"] = faviconUrl;
        }
        if (searchEngines[id].base64 === undefined || searchEngines[id].base64.length <= 0) {
            base64ImageString = getBase64Image(faviconUrl);
            searchEngines[id]["base64"] = base64ImageString;
        }
    }
}

/// Get faviconUrl
function getFaviconUrl(domain) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', AWS_API, true);
    xhr.setRequestHeader("x-api-key", AWS_API_KEY);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function(e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let faviconUrl = this.response;
            console.log(faviconUrl);
            return faviconUrl;
        }
    }

    xhr.send({"url": domain});
}

/// Generate base 64 image string for the favicon with the given url
function getBase64Image(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
  
    xhr.onload = function(e) {
        let str = "";
        if (xhr.readyState === 4 && xhr.status === 200) {
            let blob = this.response;
            str = btoa(String.fromCharCode.apply(null, new Uint8Array(blob)));
            return str;
            //browser.storage.sync.set({id: searchEngines[id]}).then(null, onError);
        } else if (xhr.readyState === 4 && xhr.status !== 200) { // Return default icon base64 string corresponding to a globe
            str = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVR4AWL4//8/RRjO8Iucx+noO0O2qmlbUEnt5r3Juas+hsQD6KaG7dqCKPgx72Pe9GIY27btZBrbtm3btm0nO12D7tVXe63jqtqqU/iDw9K58sEruKkngH0DBljOE+T/qqx/Ln718RZOFasxyd3XRbWzlFMxRbgOTx9QWFzHtZlD+aqLb108sOAIAai6+NbHW7lUHaZkDFJt+wp1DG7R1d0b7Z88EOL08oXwjokcOvvUxYMjBFCamWP5KjKBjKOpZx2HEPj+Ieod26U+dpg6lK2CIwTQH0oECGT5eHj+IgSueJ5fPaPg6PZrz6DGHiGAISE7QPrIvIKVrSvCe2DNHSsehIDatOBna/+OEOgTQE6WAy1AAFiVcf6PhgCGxEvlA9QngLlAQCkLsNWhBZIDz/zg4ggmjHfYxoPGEMPZECW+zjwmFk6Ih194y7VHYGOPvEYlTAJlQwI4MEhgTOzZGiNalRpGgsOYFw5lEfTKybgfBtmuTNdI3MrOTAQmYf/DNcAwDeycVjROgZFt18gMso6V5Z8JpcEk2LPKpOAH0/4bKMCAYnuqm7cHOGHJTBRhAEJN9d/t5zCxAAAAAElFTkSuQmCC";
            return str
        }
    };
    xhr.send();
};

/// Build a single context menu item
function buildContextMenuItem(searchEngine, id, title, faviconUrl){
    const contexts = ["selection"];

    if (!searchEngine.show) return;

    if (browserVersion > 55){
        browser.contextMenus.create({
            id: id,
            title: title,
            contexts: contexts,
            icons: { 18: faviconUrl }
        });
    } else {
        browser.contextMenus.create({
            id: id,
            title: title,
            contexts: contexts
        });
    }
}

/// Handle Storage Changes
function onStorageChanges(changes, area) {
    if (area === "sync") {
        rebuildContextMenu();
    } else if (area === "local") {
        browser.storage.local.get(["tabMode", "tabActive"]).then(setTabMode, onError);
        browser.storage.local.get("gridMode").then(setGridModeAndBuildContextMenu, onError);
        browser.storage.local.get("optionsMenuAtTop").then(setOptionsMenu, onError);
    }
}

function setOptionsMenu(data) {
    if (data.optionsMenuAtTop) {
        optionsMenuAtTop = true;
    } else { // If optionsMenuAtTop is false or if it is not set
        optionsMenuAtTop = false; // Default value for optionsMenuAtTop is false
    }
    rebuildContextMenu();
}

/// Rebuild the context menu using the search engines from storage sync
function rebuildContextMenu() {
    browser.contextMenus.removeAll();
    browser.contextMenus.onClicked.removeListener(processSearch);

	browser.storage.sync.get(null).then(
		(data) => {
			 if (optionsMenuAtTop) {
				browser.contextMenus.create({
					id: "cs-google-site",
					title: "Search this site with Google",
					contexts: ["selection"]
				});
				browser.contextMenus.create({
					id: "cs-options",
					title: "Options...",
					contexts: ["selection"]
				});
				browser.contextMenus.create({
					id: "cs-separator",
					type: "separator",
					contexts: ["selection"]
				});
			}

			searchEngines = sortByIndex(data);
			searchEnginesArray = [];
			var index = 0;
			for (let id in searchEngines) {
				let strId = "cs-" + index.toString();
				let strTitle = searchEngines[id].name;
                let url = searchEngines[id].url;
                let urlParts = url.replace('http://','').replace('https://','').split(/\//);
                let domain = urlParts[0];
				let faviconUrl = "http://www.google.com/s2/favicons?domain=" + domain;
				searchEnginesArray.push(id);
				buildContextMenuItem(searchEngines[id], strId, strTitle, faviconUrl);
				index += 1;
			}

			if (!optionsMenuAtTop) {
				browser.contextMenus.create({
					id: "cs-separator",
					type: "separator",
					contexts: ["selection"]
				});
				browser.contextMenus.create({
					id: "cs-google-site",
					title: "Search this site with Google",
					contexts: ["selection"]
				});
				browser.contextMenus.create({
					id: "cs-options",
					title: "Options...",
					contexts: ["selection"]
				});
			}
		}
	);

	browser.contextMenus.onClicked.addListener(processSearch);
}

// Perform search based on selected search engine, i.e. selected context menu item
function processSearch(info, tab){
    let id = info.menuItemId.replace("cs-", "");

    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150 || info.selectionText.length > 150) {
        selection = info.selectionText;
    }

    if (id === "google-site" && targetUrl != "") {
        displaySearchResults(targetUrl, tab.index);
        targetUrl = "";
        return;
    } else if (id === "options") {
        browser.runtime.openOptionsPage().then(null, onError);
        return;
    }

    id = parseInt(id);
    
    // At this point, it should be a number
    if(!isNaN(id)){
		let searchEngineUrl = searchEngines[searchEnginesArray[id]].url;
        if (searchEngineUrl.includes("{search terms}")) {
            targetUrl = searchEngineUrl.replace("{search terms}", encodeURIComponent(selection));
        } else if (searchEngineUrl.includes("%s")) {
			targetUrl = searchEngineUrl.replace("%s", encodeURIComponent(selection));
        } else {
            targetUrl = searchEngineUrl + encodeURIComponent(selection);
        }
        displaySearchResults(targetUrl, tab.index);
        targetUrl = "";
    }    
}

function searchUsing(id) {
    browser.storage.sync.get(null).then(function(data){
        searchEngines = sortByIndex(data);
        var url = searchEngines[id].url + selection;
        browser.tabs.query({
            currentWindow: true, 
            active: true,
        }).then(function(tabs){
            for (let tab of tabs) {
                tabPosition = tab.index;
            }
            displaySearchResults(url, tabPosition);
        });
    });
}

/// Helper functions
function displaySearchResults(targetUrl, tabPosition) {
    browser.windows.getCurrent({populate: false}).then(function(windowInfo) {
        var currentWindowID = windowInfo.id;
        if (contextsearch_openSearchResultsInNewWindow) {
            browser.windows.create({
                url: targetUrl
            }).then(function() {
                if (!contextsearch_makeNewTabOrWindowActive) {
                    browser.windows.update(currentWindowID, {
                        focused: true
                    }).then(null, onError);    
                }
            }, onError);
        } else if (contextsearch_openSearchResultsInNewTab) {
            browser.tabs.create({
                active: contextsearch_makeNewTabOrWindowActive,
                index: tabPosition + 1,
                url: targetUrl
            });
        } else {
            // Open search results in the same tab
            console.log("Opening search results in same tab");
            browser.tabs.update({url: targetUrl});
        }
    }, onError);
}

/// OMNIBOX
// Provide help text to the user
browser.omnibox.setDefaultSuggestion({
    description: `Search using Context Search with keywords. Usage: cs [keyword] [search terms]
      (e.g. "cs w Linux" searches Wikipedia for the term "Linux")`
});

// Update the suggestions whenever the input is changed
browser.omnibox.onInputChanged.addListener((input, suggest) => {
    if (input.indexOf(" ") > 0) {
        let suggestion = buildSuggestion(input);
        if (suggestion.length === 1) {
            suggest(suggestion);
//            browser.omnibox.setDefaultSuggestion({description: suggestion[0].description});
        }
    }
});

// Open the page based on how the user clicks on a suggestion
browser.omnibox.onInputEntered.addListener((input) => {
    browser.tabs.query({
        currentWindow: true, 
        active: true,
    }).then(function(tabs){
        for (let tab of tabs) {
            tabPosition = tab.index;
        }

        // Only display search results when there is a valid link inside of the url variable
        if (input.indexOf("://") > -1) {
			displaySearchResults(input, tabPosition);
		} else {
			try {
				let suggestion = buildSuggestion(input);
				if (suggestion.length === 1) {
					displaySearchResults(suggestion[0].content, tabPosition);
				} else if (input.indexOf(" ") === -1) {
					notify("Usage: cs [keyword] [search terms] (for example, cs w Linux)");
				}
			} catch(ex) {
				console.error("Failed to process " + input);
			}
		}

    }, onError);
});

function buildSuggestion(text) {
    let result = [];
    let keyword = text.split(" ")[0];
    let searchTerms = text.replace(keyword, "").trim();
    console.log(searchTerms);

	// Only make suggestions available and check for existance of a search engine when there is a space.
	if(text.indexOf(" ") === -1){
		lastAddressBarKeyword = "";
		return result;
	}

	// Don't notify for the same keyword
	let showNotification = true;
	if (lastAddressBarKeyword == keyword) showNotification = false;
	lastAddressBarKeyword = keyword;

    for (let id in searchEngines) {
        if (searchEngines[id].keyword === keyword) {
            let suggestion = {};
            suggestion["content"] = searchEngines[id].url + searchTerms;
            suggestion["description"] = "Search " + searchEngines[id].name + " for " + searchTerms;
            result.push(suggestion);
            return result;
        }
    }

	if (showNotification) {
		notify("Search engine with keyword " + keyword + " is unknown.");
	}

    return result;
}

/// Generic Error Handler
function onError(error) {
    console.log(`${error}`);
}

/// Notifications
function notify(message){
    browser.notifications.create(message.substring(0, 20),
    {
        type: "basic",
        iconUrl: browser.extension.getURL("icons/icon_96.png"),
        title: "Context Search",
        message: message
    });
}

init();