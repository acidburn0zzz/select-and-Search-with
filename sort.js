function sortAlphabetically(jsonObj) {
    // Create a new empty object
    var sortedJSON = {};
    // Build an array with ids of search engines and sort the array alphabetically
    var arrayOfIds = Object.keys(jsonObj);
    // For each element in the array, fetch its value and add it to the sorted new object
    var arrayOfNames = [];
    var sortedArrayOfNames = [];
    var tmpObj = {};
    for (let i = 0;i < arrayOfIds.length;i++) {
        arrayOfNames.push(jsonObj[arrayOfIds[i]].name);
        tmpObj[jsonObj[arrayOfIds[i]].name] = arrayOfIds[i];
    }
    var sortedArrayOfNames = arrayOfNames.sort();
    for (let item of sortedArrayOfNames) {
        sortedJSON[tmpObj[item]] = jsonObj[tmpObj[item]];
    }
    return sortedJSON;
}