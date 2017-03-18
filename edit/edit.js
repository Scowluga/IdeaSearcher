
var isNew = false; 
var ideaId = 0; 

var DELIM = "|||"; 

var titleInput = $("#titleInput"); 
var descriptionInput = $("#descriptionInput"); 

chrome.storage.local.get("current", function(result) {
	var current = result["current"]; 

	if (current == "new") {
		isNew = true; 
		addPage(); 
	} else { // it's an edit
		isNew = false; 
		ideaId = current; 
		editPage(current);  
	}
}); 

function addPage() {
	titleInput.innerHTML = ""; 
	descriptionInput.innerHTML = ""; 
}

function editPage(ideaId) {
	chrome.storage.local.get(ideaId, function(result) {
		var idea = result[ideaId].split(", "); 
		var id = parseInt(idea[0]);
		titleInput.innerHTML = idea[1]; 
		descriptionInput.innerHTML = idea[2];  
	})
}


$('#submitForm').submit(function() {
    var title = titleInput.innerHTML;  
	var desc = descriptionInput.innerHTML; 
	submit(title, desc); 
});

$("#cancel").click(function() {
	window.location = "../home.html"; 
}); 

function submit(title, desc) {
	if (isNew) { // add it 

		chrome.storage.local.get("ideaList", function(result) {
		var ideas = []
		var ideaList = result["ideaList"].split(", ");
		$.each(ideaList, function(key, value) {
			ideas.push(parseInt(value)); 
		});

		var index = 1; 
		while (true) {
			if (!ideas.contains(index)) {
				break; 
			} else {
				index ++; 
			}
		}
		chrome.storage.local.set({
				"ideaList" : ideaList + ", " + index, // update ideaList 
				index: index + DELIM + title + DELIM + desc // add the index into storage 
			});
		})
	} else { // EDIT 
		chrome.storage.local.set({ // input the new data into the storage id 
			ideaId : ideaId + DELIM + title + DELIM + desc 
		}); 
	}
	window.location = "../home.html"; 


}


