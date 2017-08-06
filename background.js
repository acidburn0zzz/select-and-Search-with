const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

// Import the Services module.
Cu.import("resource://gre/modules/Services.jsm");

// 1. Create the context menu using the search engines defined in the browser's search bar

var bss = Services.search; // browser search service

bss.init();
var searchEngines = bss.getVisibleEngines({});

for (i=0;i < searchEngines.length;i++) {
    var id$ = i.toString();
    var title$ = searchEngines[i].name;
    browser.contextMenus.create({
        id: id$,
        title: title$,
        contexts: ["all"]
    });
};

// 2. Perform search based on selected search engine, i.e. selected context menu item

function onCreated(tab) {
    console.log("Created new tab: ${tab.id}")
}

function onError(error) {
    console.log("Error: ${error}")
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
    var searchString = info.selectionText.replace(" ", "+");
    var creating = browser.tabs.create({
        url: searchEngines[parseInt(info.menuItemId)].getSubmission(searchString, null).uri.spec
    });
    creating.then(onCreated, onError);
});
