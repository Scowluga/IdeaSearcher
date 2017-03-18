


chrome.storage.local.get("current", function(return) {
	var id = return["current"]; 
	chrome.storage.local.get(id, function(return) {
		var info = return[id].split(", "); 
		$("#queryTitle").innerHTML = info[1]; // the title
	})
})