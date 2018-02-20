/// Sort search engines by index
function sortByIndex(list) {
    var sortedList = {};
    var skip = false;
    
    // If there are no indexes, then add some arbitrarily
    for (var i = 0;i < Object.keys(list).length;i++) {
		var id = Object.keys(list)[i];
		if (list[id].index != null) {
			break;
		} 
		if (list[id] != null) {
			sortedList[id] = list[id];
			sortedList[id]["index"] = i;
			skip = true;
		}
    }

    for (var i = 0;i < Object.keys(list).length;i++) {
      for (let id in list) {
        if (list[id] != null && list[id].index === i) {
          sortedList[id] = list[id];
        }
      }
    }
    return sortedList;
}