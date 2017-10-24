/// Global variables
var searchEngines = {};
var searchEnginesArray = [];
var selection = "";
var targetUrl = "";
var gridMode = false;
var lastAddressBarKeyword = "";
var remainingItems;

/// Constants
const DEFAULT_JSON = "defaultSearchEngines.json";

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
        //loadSearchEngines(DEFAULT_JSON);
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
            // First set base64 favicons to an empty string to force a reset
            for (let id in searchEngines) {
                searchEngines[id]["base64"] = "";
            }
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
    remainingItems = Object.keys(searchEngines).length;
    for (let id in searchEngines) {
        if (searchEngines[id].base64 === null || searchEngines[id].base64 === undefined || !searchEngines[id].base64.length > 0) {
            let url = searchEngines[id].url;
            let urlParts = url.replace('http://','').replace('https://','').split(/\//);
            let domain = urlParts[0];
            let faviconUrl = "https://icons.better-idea.org/icon?url=" + domain + "&size=24..32..64";
            getBase64Image(id, faviconUrl).then(function (base64String) {
                remainingItems = remainingItems - 1;
                console.log("remaining items: " + remainingItems);
                searchEngines[id]["base64"] = base64String;
                if (remainingItems === 0) {
                    console.log(searchEngines);
                    browser.storage.sync.set(searchEngines).then(null, onError);
                }
            }).catch(function (e) {
                remainingItems = remainingItems - 1;
                console.log("remaining items: " + remainingItems);
                console.log("Error occured while fetching favicon image for " + id);
                console.log(e);
            });
        } else {
            remainingItems = remainingItems - 1;
            console.log("remaining items: " + remainingItems);
        }
    }
}

/// Generate base 64 image string for the favicon with the given url
function getBase64Image(id, url) {
    var promise = new Promise(
        function resolver(resolve, reject) {
            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            requestUrl = proxyUrl + url;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', requestUrl, true);
            xhr.responseType = "arraybuffer";
            
            xhr.onload = function() {
                var str = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAG2ElEQVRYhe2Wa1CTVxrH31o/7ezM7kxndndmv6wjs4aEJCCiOx20sOPYdms7uhBaUbou5Y4JBIGogFxiR7BeqmWgSiARCAlvyA2oEMAABbkZVC6CBAkGMCGBo+jY2W5H/feDwhgToLS7s1/2mXm+vc/5/97/c55zDkX9P9YYQcna3/rwtbsCUusEvIKWM9vS9GIfgZbPOlTzrr+I/s1/S3edpL7/7Mmqb83Z5e3PDL1jsDucIITg3swsdmVqwBXqwUnSPWMn65pZfHUoj0e/+R9R5on17wmLWqzZsnbsSKOxI10No8kMQggIIbg1NgWOgAZXqH+ZOnAFNP4qUt1hRkm3/wJprKtsvlXXdsP8PPtyO1KKW3Cp3gR2XAU6BybQNzyJY2XtCE6n8XexHtxkHbhCHfyTlBgen8bktB1XukeeH71klFAU1q1NGnijsWdkoMJwE4GpKohKjIg8fQU+8XJwkjQ4UdmJwDQ1uEIdAoQ1CExXg82nwU6QY3h8GoqWAXQPWWCdmcWUzYHG3tHhNUFovh1uIITgaGkbdmVoMDFlh3NuHrsytC96Lah5xXI9OAI1QsS14Il1SLxgQEpxC8Ym7y+1iRACTftQ008SlzbcPDg3P79UuLiQc24e+YoucARqF/FFoD05Wkjq+3HH4iq8mHPz85A1XP9sVev7RyefvF58Y9SKkDwdgtNpcJI07gDJWuw8qoLDOedRfDFvjt77bsVWyA03Ml8vMprMCExVgStQuVm/mOxD1bBM2yFvHkCQSI2LtSb0DU/CMm13g6gw3MxeFqCt3zzz6sdD41Pg8mmPoi4AfBqn6W6klxiRXtKKwMNK7DyiQvjJOlQbB10A2vvNNo/iF02mX9lmnc8JIbA7nDDfsyH4iObFXK8CsPOoBuNW25JIU98YdB23Uay/jsaeOy4AdocTNN36azeAauNwiN3hxLGydgSmqhBRUO+x326ZpML125PL9r170IJRywwIITgubUdjzx2UNfQfcANQto0UXL89CU6iAjvSVODwVeAka1cFiD1vWHHjTdkcOKXsAiEEIxMzOFHZiYDEqjA3gKyK3mOWaTuumsxIu2R8ueFWt/9zeeeKAIQQlNT3o2fIggmrDXvyasHm0wfdAHxT9LwgkQb5imuYmLLDT1CN0M/r8G6GFuxD1cu6kVvesSqAZdoORcsA9ufXgSvUgRUr/9QNgCVQBy+e53vFtRBXdMA268SsYw53rTb4CapfnveuAFuEKnQOTIAQgvt2Jx5MGrBgEuHRtQgsdEfh4dA5PJgdByEEiYXN4Cbr4P2Z7AM3gD8l0H9g81VLC4fn17v8xYB5Cu+I1B7bEpimRvSZOnxTcQDzjdsw0RyHvvoM3GoUwXl1Lx5f3Y67tzTwFdBg81XYFFGyweMoboorv/viXte4ze/i1ZtU3AKuQOUGoSiLwpguCB9FJyP3TDEKCiUoKJQg/6tLGGzKxAPDNoRlfw1mXKXVozhFURQzsvQ0R1ADNl+FniHLsj39pmsUnFfc2nu8BI8MAQhJTIZ3aCaS8i4sARQUSpBy4itoSj+GsSoE3tHSL5cF8PrHxY2MWNlTrlALkaR1WYDz6l6XTXmmMA2mmt3wDs0Ak5eF8MMFLgBC8QXsEx7GQlMAorJO+i8LQFEU5R0tLfVJUICbVIOa1iGPALtzal3svyyJg748Asyw4/DmZSIu65wLwLFTRXg74jAeN23BfJ0/Y0WAP35a+BYzWnaffagaXIEKXYOurZibm0fwEdeRPF8kRBe9B0xeFrx5mYjNPLsknnv2a3BCRdgTk/DkcdMWzGgYb60IQFEU9eeY0kBmZNn3rPhK1HaOuLwN9opr3Y7oA3mFWGgKwHsxR8AMO47348Qu9jM+TH7aIQtqfWTwN60qvhiMf5btZkRJ/3VK3rYEcKV71OODhCvUo1n+MfpV7+Ptgxnw/SQTBYUSiL+8iG370p9+kfmh4WHj5udmyebYnwxAURTlFVX0l6qmvieEEAyarQjN1S57PG9Pr0Yf/RGsde/g7Lk4FJWeRmpuEhnXbm9baNz8rCPPFzXhvs6qfUzWmiDKDb0bGjoHb3+SU/VvVowMrNjLYMVXwidBAXaiEuxEJXwSFPCJl4MbL0XOqRR0K/72zHFl6/cPDZtnFgx+CruWu7VmP1epjvD7eRAURVEbI4p/tylKmsaIknUyIqU/sGJkeDUZkdIfGDHSa97RUtGGfSW/f70+h6LWqw5wFOoIP8jDfOYqeCyvNUMsRVDOei++ciMrQR3A4tNbWQm0FxWUs361shyKWl8ZzlGWhvqA3s8O//kAvyBoHu9NOpzlC4p6438C8Hr8CN553KkxVTnMAAAAAElFTkSuQmCC";
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
				let faviconUrl = "https://icons.better-idea.org/icon?url=" + domain + "&size=24..32..64";
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
            targetUrl = searchEngineUrl.replace("{search terms}", encodeUrl(selection));
        } else if (searchEngineUrl.includes("%s")) {
			targetUrl = searchEngineUrl.replace("%s", encodeUrl(selection));
        } else {
            targetUrl = searchEngineUrl + encodeUrl(selection);
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
        iconUrl: browser.extension.getURL("icons/icon_96.png"),
        title: "Context Search",
        message: message
    });
}

init();