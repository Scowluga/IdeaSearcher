
var DELIM = "|||"; 

/* Idea String Format 
ID 
Title
Description

*/

function displayBlank() { // no ideas! 
	$("#topDiv").style="display:none;"; 
	$("#botDiv").style="display:inline"; 
}

function searchBtn(id) {
	chrome.storage.local.set({"current" : id}); 
	window.location="search/search.html"; 
}

function editBtn(id) {
	alert(id + " edit"); 	
}
function deleteBtn(id) {
	// SOMEHOW CONFIRM 

}

function setup3(ideas) { 
	// Setup List First 
	for (i = 0; i < ideas.length; i ++) {
		var idea = ideas[i]; 
		var info = idea.split(DELIM); 
		var ul = document.getElementById("ideaList"); 
		var li = document.createElement("li"); 
		li.setAttribute("class", "listItem"); 
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

		ul.appendChild(li); 
	}

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

function setup2(ideaList) { // set up the list <ul> on home.html 
	var ideas = []; 
	chrome.storage.local.get(ideaList, function(result) {
		for (i = 0; i < ideaList.length; i ++) {
			ideas.push(result[ideaList[i]])
		}
		setup3(ideas); 
	})
}

function setup1() {
	chrome.storage.local.get("ideaList", function(result) {
		var ideaList = result["ideaList"].split(", "); 
		if (ideaList.length == 0) {
			displayBlank(); 
		} else {
			setup2(ideaList); 
		}
	})
}


function initialize() { // first run 
	chrome.storage.local.set({"first" : "initialized!"});
	chrome.storage.local.set({"current" : "0"}); 

	chrome.storage.local.set({ // Ideas 
		"ideaList" : "1, 2", 
		"1" : "1" + DELIM + "Transit Alarm" + DELIM + "A simple Android application that gives you customizable alarms before your stop (found be geofence).", 
		"2" : "2" + DELIM + "Virtual Shopper" + DELIM + "Ever wanted to try on the clothes you were going to buy? Do it easily with 3D modelling, and basic inputs that create a 3D avatar for your person."
	}); 

	chrome.storage.local.set({ // Pages
		"pageList" : "-1, -2, -3, -4, -5", 
		"-1" : "-1" + DELIM + "Google Search" + DELIM + "https://www.google.ca/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=ideasearcher&*", 
		"-2" : "-2" + DELIM + "Google Play Store" + DELIM + "https://play.google.com/store/search?q=ideasearcher&c=apps&hl=en", 
		"-3" : "-3" + DELIM + "Github" + DELIM + "https://github.com/search?utf8=%E2%9C%93&q=ideasearcher", 
		"-4" : "-4" + DELIM + "Reddit/sideproject" + DELIM + "https://www.reddit.com/r/SideProject/search?q=ideasearcher&restrict_sr=on&sort=relevance&t=all", 
		"-5" : "-5" + DELIM + "Wikipedia" + DELIM + "https://en.wikipedia.org/w/index.php?search=ideasearcher&title=Special:Search&profile=default&fulltext=1&searchToken=cme8739o4gak9ey4e48urylzr"
	}); 
 
	chrome.storage.local.set({ // settings. Default pages selected, open new tab
		// first integer is boolean (1/0) of whether the pages are opened in new tab
		// then list of pre-checked pages
		"settingList" : "1, -1, -2, -3" 
	}); 

	setup1(); 
}

function addIdea(idea) {
	var info = idea.split(DELIM); 
	var ul = document.getElementById("ideaList"); 
	var li = document.createElement("li"); 
	li.className = "listItem"; 
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
	ul.insertBefore(li, ul.firstChild);
}

// RUN CODE 

document.getElementById('headerAdd').onclick = function() {
	chrome.storage.local.set({"current" : "new"}); 
	window.location.href="edit/edit.html"
}; 


chrome.storage.local.get("state", function(result) {
	var state = result["state"]; 
	switch(state) {
		case undefined: 
			initialize(); 
			break; 
		case "addNew": // animate the addition 
			chrome.storage.local.get("current", function(result) {
				var idea = result["current"];  
				addIdea(idea); 
			})
			break;
		case "initialized!":
			setup1(); 
			break; 
	}
}); 



