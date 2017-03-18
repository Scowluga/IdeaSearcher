



function addSetting(name, url) {

	chrome.storage.local.get("pageList", function(result) {
		var ideas = []
		var ideaList = result["pageList"].split(", ");
		for (idea : ideaList) {
			ideas.push(parseInt(idea)); 
		} 

		var index = -1; 
		while (true) {
			if (!ideas.contains(index)) {
				break; 
			} else {
				index --; 
			}
		}
		chrome.storage.local.set({
			"pageList" : ideaList + ", " + index, 
			index: index + DELIM + title + DELIM + desc
		});

	})


}