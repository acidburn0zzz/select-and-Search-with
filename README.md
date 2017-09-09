# Context Search

Firefox add-on to search selected text using a context menu displaying a pre-specified list of search engines defined in the extension's preferences.

Right-clicking on selected text in a web page will give you the option to perform a search using any of the following search engines, by default: Amazon, Ask, Baidu, Bing, Encyclopaedia Britannica, Dogpile, DuckDuckGo, Ecosia, Facebook, Google, Google Maps, Google Scholar, Imdb, Lilo, LinkedIn, OneLook, Quora, Qwant, Stack Exchange, Startpage, Swisscows, Twitter, Wikipedia, WolframAlpha, Yahoo!, Yandex and YouTube.

Use the checkboxes in the extension's preferences to select which search engines you'd like to appear in the context menu. Don't forget to save your changes to the browser. You also have the possibility to remove the search engines you don't use at all and add custom search engines individually. You can also set whether you'd like your searches to open a tab in the foreground or in the background.

You have the possibility to upload a JSON file containing your own list of search engines. I recommend first downloading (using the 'Save to local disk' button) the list of search engines you'd like to keep from the default list and completing that list with your own favourite search engines. Downloading the file will also allow you to become familiar with the required format for each search engine. You essentially need 4 items for each search engine: an id, a name, a query string url and, finally, you need to choose a boolean value (true or false) to specify if you want the search engine to be displayed in the context menu.

The main structure of a JSON file is as follows:
```javascript
{
  "id": {
    "name": "search engine's name",
    "url": "search engine query string (without the search terms)",
    "show": takes the value true if the search engine is to be shown in the context menu and false if not
  }
}
```

Here is an example of a JSON file containing 3 search engines:
```javascript
{
  "bing": {
    "name": "Bing",
    "url": "https://www.bing.com/search?q=",
    "show": true
  },
  "google": {
    "name": "Google",
    "url": "https://www.google.com/search?q=",
    "show": true
  },
  "yahoo": {
    "name": "Yahoo!",
    "url": "https://search.yahoo.com/search?p=",
    "show": true
  }  
}
```

The firefox add-on my be found here:
https://addons.mozilla.org/fr/firefox/addon/contextual-search/?src=ss
