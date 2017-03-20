
// ---------------- GENERAL TOOLS ------------
var DELIM = "|||"; 
var currentDiv = "listDiv"; 

function changeDiv(close, open) { // no ideas 
	document.getElementById(close).style="display:none;"; 
	document.getElementById(open).style="display:inline;";
}

function contains(lst, itm) {
	// check if list ideas contains index 
	var result = $.inArray(itm, lst); 
	if (result == -1) {
		return false; 
	} else {
		return true; 
	}
}

function setUpBlank() {
	console.log("SET UP BLANK WOHOO"); 
	var ul = document.getElementById("ideaList"); 
	ul.innerHTML = ""; 
	var li = document.createElement("li"); 
	li.innerHTML = "<p>Out of ideas?</p>"; 
	ul.appendChild(li); 
}

function selected(info) {
	if (info == "true") {
		return true; 
	}
	return false; 
}

// ----------------- HOME ---------------

function getLi(idea, visible) {
	var info = idea.split(DELIM); 
	var li = document.createElement("li"); 
	li.setAttribute("class", "listItem"); 
	li.setAttribute("id", info[0] + "list"); 
	if (!visible) {
		li.style = "display:none;"; 
	}
	li.innerHTML = `<div class="ideaRow">
				<p class="itemTitle">` + info[1] + `</p>
				<div class="ideaImgs">
					<img class="ideaImg search" src="res/search.png" id="` + info[0] + `"/>
					<img class="ideaImg edit" src="res/edit.png" id="` + info[0] + `"/>
					<img class="ideaImg delete" src="res/delete.png" id="` + info[0] + `"/>
				</div>
			</div>
			<p class="itemDescription">` + info[2] + `</p> 
			<p>` + info[0] + "</p>"; // the id 
	return li; 
}

function getSearchLi(page, isChecked) {
	var info = page.split(DELIM); 
	var li = document.createElement("li"); 
	li.setAttribute("id", info[0]); 
	li.setAttribute("class", "pageItem"); 
	if (isChecked) {
		li.innerHTML = `<li>
				<input id="page` + info[0] + `" type="checkbox" checked='true'>` + info[1] + `<br>
			</li>
			`
	} else {
		li.innerHTML = `<li>
				<input id="page` + info[0] + `" type="checkbox">` + info[1] + `<br>
			</li>
			`
	}
	return li; 
}

function searchBtn(id) {
	// change div
	changeDiv(currentDiv, "searchDiv"); 
	currentDiv = "searchDiv"; 
	chrome.storage.sync.get([id, "pageList"], function(result) {
		// Pre-filled query (idea title)
		var idea = result[id].split(DELIM); 
		var title = idea[1]; 
		$("#query").val(title); 

		var pageList = result["pageList"].split(", "); // [-1, -2, -3, -4, -5]
		var pages = []; // ["-1|||google|||www.google.com..."]
		chrome.storage.sync.get(pageList, function(result) {
			var ul = document.getElementById("pages"); 
			ul.innerHTML = ""; 
			for (i = 0; i < pageList.length; i ++) { // each page
				var page = result[pageList[i]]; 
				pages.push(page); 
				var info = page.split(DELIM); // info for the page
				var id = info[0]; 

				var li = getSearchLi(page, selected(info[3])); 
				ul.appendChild(li); 
			}

			$("#searchGo").click(function() { // change back to home 
				var query = $("#query").val(); 
				var toBeOpened = []; 
				for (i = 0; i < pageList.length; i ++) {
					var info = pages[i].split(DELIM); 
					var id = info[0]; 
					if ($('#page' + id.toString()).is(":checked")) {
						var parts = info[2].split("ideasearcher"); 
						var url = parts[0] + query + parts[1]; 
						toBeOpened.push(url); 
					}
				}
				console.log("opening: " + toBeOpened); 
				for (i = 0; i < toBeOpened.length; i ++) {
					var url = toBeOpened[i]; 
					window.open(url); 
				}
			}); 

			$("#searchCancel").click(function() { // change back to home 
				changeDiv(currentDiv, "listDiv");
				currentDiv = "listDiv"; 
			}); 

		}); 
	}); 
}

function editBtn(id) {
	changeDiv(currentDiv, "editDiv"); 
	currentDiv = "editDiv"; 
	openEdit(false, id); // not new 
}

function deleteBtn(id) {
	chrome.storage.sync.get("ideaList", function(result) {
		var list_ideas = result["ideaList"].trim(); 
		var ideas = list_ideas.split(", "); // [1, 3, 4]
	
		if (ideas.length == 1) {
			chrome.storage.sync.set({"ideaList" : ""}, function() {
				console.log("The list is now empty!"); 
				$("#" + id + "list").slideUp(); 
				setTimeout(setUpBlank, 400); 
			})
		} else { // MORE THAN ONE VALUE, DO NOT SET UP BLANK
			var retList = []; 
			for (i = 0; i < ideas.length; i ++) {
				var idea = ideas[i]; 
				if (idea == id) {
					continue; 
				} else {
					retList.push(idea); 
				}
			}

			var retString = retList[0]; // first item 
			for (i = 1; i < retList.length; i ++) {
				retString += ", " + retList[i]; 
			}

			retString = retString.trim(); 
			var toBeRet = {}; 
			toBeRet["ideaList"] = retString.toString(); 
			chrome.storage.sync.set(toBeRet, function() {
				console.log("old list: " + list_ideas); 
				console.log("new list: " + retString.toString()); 
				console.log("String with id: " + id + " deleted!"); 
				console.log("re-setting up page..."); 
				// SOMEHOW CONFIRM 
				$("#" + id + "list").slideUp(); 
			});
		}
	});
}

function setButtonListeners() {
	$('.search').click(function(){
		searchBtn(this.id);
	});
	$('.edit').click(function(){
		editBtn(this.id);
	});
	$('.delete').click(function(){
		deleteBtn(this.id);
	});
}

function display(ideas) { 
	// Setup List First 
	var ul = document.getElementById("ideaList"); 
	ul.innerHTML = ""; 
	for (i = 0; i < ideas.length; i ++) {
		var idea = ideas[i]; 
		li = getLi(idea, true); 
		ul.insertBefore(li, ul.firstChild); 
	}
	setButtonListeners(); 
}

function setup () { // gets ideaList from storage, displays 
	chrome.storage.sync.get("ideaList", function(result) {
		currentDiv = "listDiv"; 
		var entire = result["ideaList"].trim(); 
		if (entire.length == 1) {
			console.log("empty list!"); 
		} else { // LIST IS NOT EMPTY 
			var ideaList = entire.split(", "); // [1, 2, 3, 4]
			for (i = 0; i < ideaList.length; i ++) {
				var item = ideaList[i]; 
				if (item == "" || item == undefined || item == ",") {
					console.log("uh oh item : " + item); 
					ideaList.splice(i, 1); 
				}
			}
			var ideas = []; // ["1|||title|||desc", "2||||wasdf|||awef"..,]
			chrome.storage.sync.get(ideaList, function(result) {
				for (i = 0; i < ideaList.length; i ++) {
					ideas.push(result[ideaList[i]]); 
				}
				display(ideas); // display the list of strings 
			}); 
		}; 
	}); 
}; 

// ----------------- EDIT -----------------

var isNew = false; 
var editId = 0; 

function addIdea(idea) { // adds an idea 
	var ul = document.getElementById("ideaList"); 
	var li = getLi(idea, false); 
	ul.insertBefore(li, ul.firstChild);
	$(li).slideDown();
	setButtonListeners(); 
}

function submit(title, desc) {
	if (isNew) { // add it 
		chrome.storage.sync.get("ideaList", function(result) {
			var ideas = []
			var ideasStringLst = result["ideaList"].trim(); 

			var index = 1; 
			var ideasList = ideasStringLst.split(", ");
			$.each(ideasList, function(key, value) {
				ideas.push(parseInt(value)); 
			});

			while (true) {
				if (!contains(ideas, index)) {
					break; 
				} else {
					index ++; 
				}; 
			}; 			
			
			var id = index.toString(); 
			var newIdea = id + DELIM + title + DELIM + desc; 
			var key = "ideaList"; 
			var value = ideasStringLst + ", " + id; 

			var toBeRet = {}; 
			toBeRet[id.toString()] = newIdea; 
			toBeRet['ideaList'] = value.trim(); 

			chrome.storage.sync.set(toBeRet, function() {
				console.log("toBeRet saved!"); 
				console.log("display add..."); 
				changeDiv(currentDiv, "listDiv"); 
				currentDiv = "listDiv"; 
				addIdea(newIdea);
			})
		}); 
	} else { // EDIT 
		var toBeRet = {}; 
		toBeRet[editId.toString()] = editId + DELIM + title + DELIM + desc; 
		chrome.storage.sync.set(toBeRet, function() { 
			console.log("updated id: " + editId); 
			changeDiv(currentDiv, "listDiv"); 
			currentDiv = "listDiv";
			setup(); // re-setup with edited idea 
		}); 
	};
}; 

$('#submit').click(function() {
    var title = $("#titleInput").val();  
	var desc = $("#descriptionInput").val();
	submit(title, desc);
	return false;
});

$("#cancel").click(function() { // change back to home 
	changeDiv(currentDiv, "listDiv");
	currentDiv = "listDiv"; 
}); 

function openEdit(isadd, id) {
	isNew = isadd; 
	editId = id; 
	if (isadd) {
		$("#titleInput").val("Default title"); 
		$("#descriptionInput").val("Default description");  
	} else { // is Edit
		chrome.storage.sync.get(editId, function(result) {
			var info = result[editId].trim().split(DELIM); 
			$("#titleInput").val(info[1]); 
			$("#descriptionInput").val(info[2]);  
		});
	}
}; 


// --------------------- SETTINGS ---------------------
/*
[0] id 
[1] name 
[2] url 
[3] checked 
*/


var pages = null; // ['-1', '-2', '-3'] /

function getSettingLi(page, visible) {
	var info = page.split(DELIM); 
	var shown = selected(info[3]); 

	var li = document.createElement("li"); 
	li.setAttribute("id", info[0] + "li"); 

	if (shown) {
		li.innerHTML = `
				Name: <strong><span id="` + info[0] + `name">` + info[1] + `</span></strong>
				<input type="checkbox" checked="true" id="` + info[0] + `checked">
				<button id="` + info[0] + `" class="deleteSetting">x</button>
				<br>URL: <span id="` + info[0] + `url">` + info[2] + `</span>
				`
	} else {
		li.innerHTML = `
				Name: <strong><span id="` + info[0] + `name">` + info[1] + `</span></strong>
				<input type="checkbox" id="` + info[0] + `checked">
				<button id="` + info[0] + `" class="deleteSetting">x</button>
				<br>URL: <span id="` + info[0] + `url">` + info[2] + `</span>
				`
	}

	return li; 
}

function settingDeleteButton() {
	$('.deleteSetting').click(function(){
		if (pages.length > 1) {
			var id = this.id
			pages.splice(this.id, 1); 
			console.log("spliced id: " + this.id); 
			$("#" + this.id + "li").slideUp(); 
		} else {
			// alert("Must have at least one page."); 
		}
	});
}

function settings(pageList) {
	// pageList is ["-1", "-2", "-3"]... 
	pages = pageList; 
	// SET UP THE PRE-EXISTING LIST 
	chrome.storage.sync.get(pageList, function(result) {
		var ul = document.getElementById("settingList"); 
		ul.innerHTML = ""; 

		for (i = 0; i < pageList.length; i ++) {
			var page = result[pageList[i]]; // -3|||Google|||www.google.ca
			li = getSettingLi(page, true); 
			ul.appendChild(li); 
		}

		settingDeleteButton(); 

		$('#addPage').click(function(){ // save changes
			var name = $("#pageName").val(); 
			var url = $("#pageURL").val(); 
			if (name == "" || url == "") {
				// alert("One or more fields is empty."); 
			} else { // continue with addition 
				index = -1; 
				while (true) {
					if (!contains(pages, index.toString())) {
						break;
					} 
					index --; 
				}
				console.log("found un-used index: " + index.toString()); 
				var page_id = index.toString(); 
				var pageInfo = page_id + DELIM + name + DELIM + url + DELIM + "false"; 
				var toBeRet = {}; 
				toBeRet[page_id.toString()] = pageInfo; 
				chrome.storage.sync.set(toBeRet, function() {
					console.log("saved: " + pageInfo); 
					pages.push(page_id); 
					var li = getSettingLi(pageInfo, false); 
					ul.appendChild(li); 
					$(li).slideDown(); 
					settingDeleteButton(); 

					// reset the inputs 
					$("#pageName").val(""); 
					$("#pageURL").val("");  
				}); 
			}
		});

		$('#saveSettings').click(function(){ // save changes
			var toBeRet = {}; 
			var pageString = pages[0]; 
			for (i = 1; i < pages.length; i ++) {
				pageString += ", " + pages[i]; 
			}
			toBeRet["pageList"] = pageString; 
			console.log("new pageList: " + pageString); 
			for (i = 0; i < pages.length; i ++) {
				var id = pages[i]; 
				var name = document.getElementById(id + "name").innerHTML; 
				var url = document.getElementById(id + "url").innerHTML; 
				var isChecked = $('#' + id.toString() + "checked").is(":checked"); 
				var single = id + DELIM + name + DELIM + url + DELIM + isChecked.toString(); 
				toBeRet[id.toString()] = single; 
				console.log("saving: " + single);  
			}
			chrome.storage.sync.set(toBeRet, function() {
				// alert("Settings Saved!"); 
				console.log("settings saved!"); 
			}); 
		});

		$('#settingCancel').click(function(){ // GO BACK 
			changeDiv(currentDiv, "listDiv"); 
			currentDiv = "listDiv"; 
		});
	}); 

}

// -------------------- INIALIZE ------------------------

function initialize() { // setup init
	chrome.storage.sync.set({
		"state" : "initialized!", // it won't happen again 
		// IDEAS
		"ideaList" : "1, 2", 
		"1" : "1" + DELIM + "Transit Alarm" + DELIM + "A simple Android application that gives you customizable alarms before your stop (found be geofence).", 
		"2" : "2" + DELIM + "Virtual Shopper" + DELIM + "Ever wanted to try on the clothes you were going to buy? Do it easily with 3D modelling, and basic inputs that create a 3D avatar for your person.",
		// PAGES 
		"pageList" : "-1, -2, -3, -4, -5", 
		"-1" : "-1" + DELIM + "Google Search" + DELIM + "https://www.google.ca/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=ideasearcher&*" + DELIM + "true", 
		"-2" : "-2" + DELIM + "Google Play Store" + DELIM + "https://play.google.com/store/search?q=ideasearcher&c=apps&hl=en" + DELIM + "true", 
		"-3" : "-3" + DELIM + "Github" + DELIM + "https://github.com/search?utf8=%E2%9C%93&q=ideasearcher" + DELIM + "true", 
		"-4" : "-4" + DELIM + "Reddit/sideproject" + DELIM + "https://www.reddit.com/r/SideProject/search?q=ideasearcher&restrict_sr=on&sort=relevance&t=all" + DELIM + "false", 
		"-5" : "-5" + DELIM + "Wikipedia" + DELIM + "https://en.wikipedia.org/w/index.php?search=ideasearcher&title=Special:Search&profile=default&fulltext=1&searchToken=cme8739o4gak9ey4e48urylzr" + DELIM + "false" 
	
	}, function() {
		setup(); 
	}); 
}

// ------------------- RUN CODE --------------------------

document.getElementById('headerAdd').onclick = function() {
	// addIdea("3|||ALAN|||wow so cool"); 
	changeDiv(currentDiv, "editDiv"); 
	currentDiv = "editDiv"; 
	openEdit(true, "0"); // not new 
}; 

document.getElementById("headerSettings").onclick = function() {
	changeDiv(currentDiv, "settingDiv"); 
	currentDiv = "settingDiv";

	chrome.storage.sync.get("pageList", function(result) {
		settings(result["pageList"].trim().split(", ")); 
	});
}; 

$(document).ready(function() {
    chrome.storage.sync.get("state", function(result) {
		var state = result["state"]; 
		switch(state) {
			case undefined: 
				initialize(); 
				break; 
			case "initialized!":
				chrome.storage.sync.get(["3", "4", "ideaList"], function(result) {
					console.log("Starting initialized"); 
					console.log("ideaList: " + result["ideaList"]); 

					// Actually Run 
					chrome.storage.sync.clear(); 
					initialize(); 
					// setup(); 
				}); 
				break; 
		}
	}); 
});




