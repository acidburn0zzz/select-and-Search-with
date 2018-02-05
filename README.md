# Context Search

Firefox add-on to <b><em>search selected text using a context menu</em></b> displaying a pre-specified list of search engines defined in the extension's preferences.

Click on the <b><em>"Preferences"</em></b> button in the bottom left hand corner, on the extension's preferences page, to manage your search engines and settings for the extension. You may have to scroll down to see the button appear.

Right-clicking on selected text in a web page will give you the option to perform a search using any of the following <b><em>default search engines</em></b>: Amazon, Ask, Baidu, Bing, Encyclopaedia Britannica, Dogpile, DuckDuckGo, eBay, Ecosia, Facebook, Google, Google Maps, Google Scholar, Google Translate (from any language to english), Imdb, Lilo, LinkedIn, OneLook, Quora, Qwant, Stack Exchange, Startpage, Swisscows, Twitter, Wikipedia, WolframAlpha, Yahoo!, Yandex and YouTube.

Use the check boxes in the extension's preferences to select which search engines you'd like to appear in the context menu. Don't forget to save your changes to the browser using the "Save prefernces" button. You also have the possibility to <b><em>remove search engines</em></b> you don't use at all and to <em>add custom search engines</em> individually. You can also set whether you'd like to <b><em>open your searches in a new tab or window in the foreground or in the background</em></b>, or to specify if you'd like the search results to appear in the same tab.

You can now <b><em>add search query strings containing the parameters %s or {searchTerms}</em></b> where you'd like your search keywords to appear.

You have the possibility to <b><em>import a JSON file containing your own list of search engines</em></b>. It is recommended to first <b><em>export the list of search engines</em></b> you'd like to keep from the default list and completing that list with your own favourite search engines. Exporting the file will also allow you to become familiar with the required format for each search engine. You essentially need 5 items for each search engine: an id, an index, a name, a query string url and, finally, you need to choose a boolean value (true or false) to specify if you want the search engine to be displayed in the context menu.

The main <b><em>structure of a JSON file</em></b> is as follows:

```javascript
{
  "id": {
    "index": 0,
    "name": "search engine's name",
    "url": "search engine query string (without the search terms)",
    "show": takes the value true if the search engine is to be shown in the context menu or false if not
  }
}
```

Here is an example of a JSON file containing 3 search engines:
```javascript
{
  "bing": {
    "index": 0,
    "name": "Bing",
    "url": "https://www.bing.com/search?q=",
    "show": true
  },
  "google": {
    "index": 1,
    "name": "Google",
    "url": "https://www.google.com/search?q=",
    "show": true
  },
  "yahoo": {
    "index": 2,
    "name": "Yahoo!",
    "url": "https://search.yahoo.com/search?p=",
    "show": true
  }  
}
```

The Firefox add-on may be found here:
https://addons.mozilla.org/firefox/addon/contextual-search/

## Planned features

* Integration with Firefox search engines, which will be implemented when it becomes possible. See https://github.com/odebroqueville/contextSearch/issues/60
