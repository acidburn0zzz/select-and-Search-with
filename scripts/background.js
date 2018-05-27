/// Global variables
let searchEngines = {};
let searchEnginesArray = [];
let selection = "";
let targetUrl = "";
let lastAddressBarKeyword = "";

/// Constants
const getFaviconUrlNow = "https://getfaviconurl-node.now.sh/icon?url=";
const herokuAppUrl = "https://get-favicons.herokuapp.com/icon?url="; // "https://get-favicons-besticon.herokuapp.com/icon?url="; // 
const herokuAppUrlSuffix = "&size=16..32..128";
const appUrlCorsAnywhere = "https://cors-anywhere.herokuapp.com/";
const base64ContextSearchIcon = "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";

// Constants for translations
const notifyEnableStorageSync = browser.i18n.getMessage("notifyEnableStorageSync");
const notifySearchEnginesLoaded = browser.i18n.getMessage("notifySearchEnginesLoaded");
const titleMultipleSearchEngines = browser.i18n.getMessage("titleMultipleSearchEngines");
const titleGoogleSearch = browser.i18n.getMessage("titleGoogleSearch");
const titleOptions = browser.i18n.getMessage("titleOptions");
const windowTitle = browser.i18n.getMessage("windowTitle");
const omniboxDescription = browser.i18n.getMessage("omniboxDescription");
const notifyUsage = browser.i18n.getMessage("notifyUsage");
const notifySearchEngineWithKeyword = browser.i18n.getMessage("notifySearchEngineWithKeyword");
const notifyUnknown = browser.i18n.getMessage("notifyUnknown");
const notifySearchEngineUrlRequired = browser.i18n.getMessage("notifySearchEngineUrlRequired");

/// Preferences
let contextsearch_optionsMenuLocation = "bottom";
let contextsearch_openSearchResultsInNewTab = true;
let contextsearch_makeNewTabOrWindowActive = false;
let contextsearch_openSearchResultsInNewWindow = false;
let contextsearch_getFavicons = true;
let contextsearch_gridMode = false;

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
        case "reset":
            resetSearchEngines();
			rebuildContextMenu();
            break;
        case "sendCurrentTabUrl":
            if (message.data) targetUrl = message.data;
            break;
        case "testSearchEngine":
            testSearchEngine(message.data);
            break;
        case "addNewFavicon":
            browser.storage.sync.get().then((se) => {
                addNewFavicon(se, message.data);
            }, onError);
            break;
        default:
            break;
    }
});

/// Initialisation
function init() {
	// Load the search engines
	detectStorageSupportAndReadSearchEngines();

    browser.storage.local.get(["tabMode", "tabActive"]).then(fetchTabMode, onError);
    browser.storage.local.get("gridMode").then(setGridMode, onError);
    browser.storage.local.get("optionsMenuLocation").then(setOptionsMenu, onError);
    browser.storage.local.get("favicons").then(setGetFavicons, onError);
    
    // Rebuild context menu with or without icons, taking into account all settings related to the context menu
    rebuildContextMenu();
    
    browser.storage.onChanged.addListener(onStorageChanges);
}

function setGetFavicons(data) {
	if(data.favicons != null) {
		contextsearch_getFavicons = data.favicons;
	} else {
		contextsearch_getFavicons = true; // default is true
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

function setGridMode(data) {
    if (data.gridMode === true || data.gridMode === false) {
        contextsearch_gridMode = data.gridMode;
    } else {
        // Set default value for gridMode to false if it is not set to true or false
        contextsearch_gridMode = false;
        browser.storage.local.set({"gridMode": false}).then(null, onError);
    }
}

// To support Firefox ESR, we should check whether browser.storage.sync is supported and enabled.
function detectStorageSupportAndReadSearchEngines() {
    browser.storage.sync.get(null).then(onGot, onNone);

    // Load search engines if they're not already loaded in storage sync
	function onGot(data){
        if (Object.keys(data).length == 0) {
            // Storage sync is empty -> load default list of search engines
            resetSearchEngines();
        } else {
            searchEngines = sortByIndex(data);
            initializeFavicons();
        }
	}

	function onNone(error){
        resetSearchEngines();
		if (error.toString().indexOf("Please set webextensions.storage.sync.enabled to true in about:config") > -1) {
			notify(notifyEnableStorageSync);
		} else {
            onError(error);
        }
	}
}

function resetSearchEngines(){
	const DEFAULT_JSON = "defaultSearchEngines.json";
	loadDefaultSearchEngines(DEFAULT_JSON);
}

/// Load default list of search engines
function loadDefaultSearchEngines(jsonFile) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", jsonFile, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.overrideMimeType("application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            searchEngines = JSON.parse(this.responseText);
            
			// First set base64 favicons to an empty string to force a reset
			for (let id in searchEngines) {
				searchEngines[id]["base64"] = null;
			}
            
            // Fetch missing favicon urls and generate corresponding base64 images
            initializeFavicons();

            browser.storage.sync.set(searchEngines).then(function() {
                 notify(notifySearchEnginesLoaded);
            }, onError);
        }
    };
    xhr.send();
}

/// Get and store favicon urls and base64 images
function initializeFavicons() {
    for (let id in searchEngines) {
        if (searchEngines[id].base64 === null || searchEngines[id].base64 === undefined || !searchEngines[id].base64.length > 0) {
            addNewFavicon(searchEngines, id);
        }
    }
    browser.storage.sync.set(searchEngines).then(null, onError);
}

/// Add favicon to newly added search engine
function addNewFavicon(searchEngines, id) {
    let url = searchEngines[id].url;
    let domain = getDomain(url);
    let faviconUrl = getFaviconUrlNow + domain;
	getBase64Image(id, faviconUrl).then(function (base64String) {
		searchEngines[id]["base64"] = base64String;
	}, function(faviconNotFoundError) {
		let faviconUrl = herokuAppUrl + domain + herokuAppUrlSuffix;
		getBase64Image(id, faviconUrl).then(function (base64String) {
			searchEngines[id]["base64"] = base64String;
		}, function(bestIconNotFoundError){
            searchEngines[id]["base64"] = base64ContextSearchIcon;
		});
	});
}

function getDomain(url){
	let urlParts = url.replace('http://','').replace('https://','').split(/\//);
    let domain = urlParts[0];
	return domain;
}

/// Generate base64 image string for the favicon with the given url
function getBase64Image(id, url) {
    let promise = new Promise(
        function resolver(resolve, reject) {
            const proxyUrl = appUrlCorsAnywhere;
            requestUrl = proxyUrl + url;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', requestUrl, true);
            xhr.responseType = "arraybuffer";
            
            xhr.onload = function() {
                // Set default base64 string to Context Search extension icon
                var str = base64ContextSearchIcon;
                
				if (xhr.status === 404) {
					reject(xhr.status);
				}
                if (xhr.status === 200) {
                    let blob = xhr.response;
                    str = btoa(String.fromCharCode.apply(null, new Uint8Array(blob)));
                }
				resolve(str);
            }
        
            xhr.onerror = function(e) {
                reject(e);
            }
        
            xhr.send();
        }
    );
    return promise;
}

/// Build a single context menu item
function buildContextMenuItem(searchEngine, index, title, base64String, browserVersion){
	const contexts = ["selection"];
	let faviconUrl = "data:image/png;base64," + base64String;

	if (!searchEngine.show) return;

	if (browserVersion > 55 && contextsearch_getFavicons === true){
		browser.contextMenus.create({
			id: index,
			title: title,
			contexts: contexts,
			icons: { "20": faviconUrl }
		});
	} else {
		browser.contextMenus.create({
			id: index,
			title: title,
			contexts: contexts
		});
	}
}

/// Handle Storage Changes
function onStorageChanges(changes, area) {
    init();
}

function setOptionsMenu(data) {
    if (data.optionsMenuLocation === "top" || data.optionsMenuLocation === "bottom" || data.optionsMenuLocation === "none") {
		contextsearch_optionsMenuLocation = data.optionsMenuLocation;
    } else {
        // Set default to "bottom" if no values are set for optionsMenuLocation
        contextsearch_optionsMenuLocation = "bottom";
        browser.storage.local.set({"optionsMenuLocation": "bottom"}).then(null, onError);
    }
}

/// Rebuild the context menu using the search engines from storage sync
function rebuildContextMenu() {
	// Rebuild context menu with or without icons
    browser.runtime.getBrowserInfo().then((info) => {
		let v = info.version;
        let browserVersion = parseInt(v.slice(0, v.search(".") - 1));
        
        browser.contextMenus.removeAll();
		browser.contextMenus.onClicked.removeListener(processSearch);

		browser.storage.sync.get(null).then(
			(data) => {
				if (contextsearch_optionsMenuLocation === "top") {
					rebuildContextOptionsMenu();
				}

				searchEngines = sortByIndex(data);
				searchEnginesArray = [];
				var index = 0;
				for (let id in searchEngines) {
					let base64String = searchEngines[id].base64;
					let strIndex = "cs-" + index.toString();
					let strTitle = searchEngines[id].name;
					//let url = searchEngines[id].url;
					//let domain = getDomain(url);
					//let faviconUrl = herokuAppUrl + domain + herokuAppUrlSuffix;
					searchEnginesArray.push(id);
					buildContextMenuItem(searchEngines[id], strIndex, strTitle, base64String, browserVersion);
					index += 1;
				}

				if (contextsearch_optionsMenuLocation === "bottom") {
					rebuildContextOptionsMenu();
				}
			}
		);

		browser.contextMenus.onClicked.addListener(processSearch);
	});
}

function rebuildContextOptionsMenu(){
    if (contextsearch_optionsMenuLocation === "bottom") {
        browser.contextMenus.create({
            id: "cs-separator",
            type: "separator",
            contexts: ["selection"]
        });
    }
    browser.contextMenus.create({
		id: "cs-multitab",
		title: titleMultipleSearchEngines,
		contexts: ["selection"]
	});
	browser.contextMenus.create({
		id: "cs-google-site",
		title: titleGoogleSearch,
		contexts: ["selection"]
	});
	browser.contextMenus.create({
		id: "cs-options",
		title: titleOptions + "...",
		contexts: ["selection"]
    });
    if (contextsearch_optionsMenuLocation === "top") {
        browser.contextMenus.create({
            id: "cs-separator",
            type: "separator",
            contexts: ["selection"]
        });
    }
}

// Perform search based on selected search engine, i.e. selected context menu item
function processSearch(info, tab){
    let id = info.menuItemId.replace("cs-", "");

    // Prefer info.selectionText over selection received by content script for these lengths (more reliable)
    if (info.selectionText.length < 150 || info.selectionText.length > 150) {
        selection = info.selectionText.trim();
    }

    if (id === "google-site" && targetUrl != "") {
        displaySearchResults(targetUrl, tab.index);
        return;
    } else if (id === "options") {
        browser.runtime.openOptionsPage().then(null, onError);
        return;
    } else if (id === "multitab") {
        processMultiTabSearch();
        return;
    }

    id = parseInt(id);
    
    // At this point, it should be a number
    if(!isNaN(id)){
		targetUrl = getSearchEngineUrl(searchEngines[searchEnginesArray[id]].url, selection);
        displaySearchResults(targetUrl, tab.index);
    }
}

function processMultiTabSearch() {
    browser.storage.sync.get(null).then(function(data){
        searchEngines = sortByIndex(data);
        let multiTabSearchEngineUrls = [];
        for (let id in searchEngines) {
            if (searchEngines[id].multitab) {
                multiTabSearchEngineUrls.push(getSearchEngineUrl(searchEngines[id].url, selection));
            }
        }
        console.log(multiTabSearchEngineUrls);
        browser.windows.create({
            titlePreface: windowTitle + '"' + selection + '"',
            url: multiTabSearchEngineUrls
        }).then(null, onError);
    }, onError);
}

// Handle search terms if there are any
function getSearchEngineUrl(searchEngineUrl, selection){
	if (searchEngineUrl.includes("{searchTerms}")) {
		return searchEngineUrl.replace(/{searchTerms}/g, encodeUrl(selection));
	} else if (searchEngineUrl.includes("%s")) {
		return searchEngineUrl.replace(/%s/g, encodeUrl(selection));
	} else {
		return searchEngineUrl + encodeUrl(selection);
	}
}

function searchUsing(id) {
    browser.storage.sync.get(null).then(function(data){
        searchEngines = sortByIndex(data);
        var searchEngineUrl = searchEngines[id].url;
        if (searchEngineUrl.includes("{searchTerms}")) {
            targetUrl = searchEngineUrl.replace(/{searchTerms}/g, encodeUrl(selection));
        } else if (searchEngineUrl.includes("%s")) {
            targetUrl = searchEngineUrl.replace(/%s/g, encodeUrl(selection));
        } else {
            targetUrl = searchEngineUrl + encodeUrl(selection);
        }

        // Get the tab position of the active tab in the current window
        browser.tabs.query({
            currentWindow: true, 
            active: true,
        }).then(function(tabs){
            for (let tab of tabs) {
                tabPosition = tab.index;
            }
            displaySearchResults(targetUrl, tabPosition);
        });
    });
}

/// Helper functions
// Display the search results
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
            console.log("Opening search results in same tab, url is " + targetUrl);
            browser.tabs.update({url: targetUrl});
        }
    }, onError);
}

/// OMNIBOX
// Provide help text to the user
browser.omnibox.setDefaultSuggestion({
    description: omniboxDescription
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
					notify(notifyUsage);
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

	// Only make suggestions available and check for existence of a search engine when there is a space.
	if (text.indexOf(" ") === -1) {
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
            let searchEngineUrl = searchEngines[id].url;
            if (searchEngineUrl.includes("{searchTerms}")) {
                targetUrl = searchEngineUrl.replace(/{searchTerms}/g, encodeUrl(searchTerms));
            } else if (searchEngineUrl.includes("%s")) {
                targetUrl = searchEngineUrl.replace(/%s/g, encodeUrl(searchTerms));
            } else {
                targetUrl = searchEngineUrl + encodeUrl(searchTerms);
            }
            suggestion["content"] = targetUrl;
            suggestion["description"] = "Search " + searchEngines[id].name + " for " + searchTerms;
            result.push(suggestion);
            return result;
        }
    }

	if (showNotification) {
		notify(notifySearchEngineWithKeyword + " " + keyword + " " + notifyUnknown);
	}

    return result;
}

function testSearchEngine(engineData){
	if(engineData.url != ""){
		let tempTargetUrl = getSearchEngineUrl(engineData.url, "test");
		browser.tabs.create({url: tempTargetUrl});
	}else{
		notify(notifySearchEngineUrlRequired);
	}
}

/// Generic Error Handler
function onError(error) {
    console.error(`${error}`);
}

/// Encode a url
function encodeUrl(url) {
    if (isEncoded(url)) {
        return url;
    }
    return encodeURIComponent(url);
}

/// Verify is uri is encoded
function isEncoded(uri) {
    uri = uri || "";  
    return uri !== decodeURIComponent(uri);
}

/// Notifications
function notify(message){
    browser.notifications.create(message.substring(0, 20),
    {
        type: "basic",
        iconUrl: browser.extension.getURL("icons/icon_64.png"),
        title: browser.i18n.getMessage("extensionName"),
        message: message
    });
}

init();
