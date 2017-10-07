// Provide help text to the user
browser.omnibox.setDefaultSuggestion({
  description: `Search using Context Search with keywords
    (e.g. "cs w linux" searches Wikipedia for the term "linux")`
});

// Update the suggestions whenever the input is changed
browser.omnibox.onInputChanged.addListener((input, suggest) => {
    suggest(buildSuggestion(input));
  });

// Open the page based on how the user clicks on a suggestion
browser.omnibox.onInputEntered.addListener((url, disposition) => {
    switch (disposition) {
      case "currentTab":
        browser.tabs.update({url});
        break;
      case "newForegroundTab":
        browser.tabs.create({url});
        break;
      case "newBackgroundTab":
        browser.tabs.create({url, active: false});
        break;
    }
});

function buildSuggestion(text) {
    var result = [];
    let suggestion = {};
    let keyword = text.split(" ")[0];
    let searchTerms = text.replace(keyword, "").trim();

    for (let id in searchEngines) {
        if (searchEngines[id].keyword === keyword) {
            suggestion["content"] = searchEngines[id].url + searchTerms;
            suggestion["description"] = "Search " + searchEngines[id].name + " for " + searchTerms;
            result.push(suggestion);
            return result;
        }
    }

    notify("Search engine unknown.");
    return result;
}
