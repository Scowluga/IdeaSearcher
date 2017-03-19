
// ---------------- GENERAL TOOLS ------------
var DELIM = "|||"; 

function changeDiv(close, open) { // no ideas 
	document.getElementById(close).style="display:none;"; 
	document.getElementById(open).style="display:inline;";
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

function searchBtn(id) {
	chrome.storage.sync.set({"current" : id}, function() {
		document.location.href="search/search.html"; 
	}); 
}

function editBtn(id) {
	changeDiv("topDiv", "editDiv"); 
	openEdit(false, id); // not new 
}

function deleteBtn(id) {
	// SOMEHOW CONFIRM 
	$("#" + id + "list").slideUp(); 
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
	for (i = 0; i < ideas.length; i ++) {
		var idea = ideas[i]; 
		var ul = document.getElementById("ideaList"); 
		li = getLi(idea, true); 
		ul.appendChild(li); 
	}
	setButtonListeners(); 
}

function setup () { // gets ideaList from storage, displays 
	chrome.storage.sync.get("ideaList", function(result) {
		var ideaList = result["ideaList"].split(", "); // [1, 2, 3, 4]
		if (ideaList.length == 0) {
			changeDiv("topDiv", "botDiv"); 
		} else { // you have [1, 2, 3, 4], now get list of their respective strings
			var ideas = []; // ["1|||title|||desc", "2||||wasdf|||awef"..,]
			chrome.storage.sync.get(ideaList, function(result) {
				for (i = 0; i < ideaList.length; i ++) {
					ideas.push(result[ideaList[i]]); 
				}
				display(ideas); // display the list of strings 
			}); 
		}
	})
}

// ----------------- EDIT -----------------

var isNew = false; 
var editId = 0; 

function contains(ideas, index) {
	// check if list ideas contains index 
	var result = $.inArray(index, ideas); 
	if (result == -1) {
		return false; 
	} else {
		return true; 
	}
}

function addIdea(idea) { // adds an idea 
	var ul = document.getElementById("ideaList"); 
	var li = getLi(idea, false); 
	ul.insertBefore(li, ul.firstChild);
	$(li).slideDown();
	setup(); 
}

function submit(title, desc) {
	if (isNew) { // add it 
		chrome.storage.sync.get("ideaList", function(result) {
			var ideas = []
			var ideasStringLst = result["ideaList"]; 
			var ideasList = ideasStringLst.split(", ");
			$.each(ideasList, function(key, value) {
				ideas.push(parseInt(value)); 
			});

			var index = 1; 
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

			chrome.storage.sync.set({ 
				id : newIdea, 
				key : value
			}, function() { 
				console.log("Idea added to storage, and to ideaList"); 
				console.log(newIdea); 
				changeDiv("editDiv", "topDiv"); 
				addIdea(newIdea);
				console.log('idea added'); 
			});
		}); 
		console.log('it worked');
	} else { // EDIT 
		chrome.storage.sync.set({ // input the new data into the storage id 
			editId : editId + DELIM + title + DELIM + desc 
		}, function() { 
			changeDiv("editDiv", "topDiv"); 
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
	changeDiv("editDiv", "topDiv");
}); 

function openEdit(isadd, id) {
	isNew = isadd; 
	editId = id; 
	if (isadd) {
		$("#titleInput").val("Default title"); 
		$("#descriptionInput").val("Default description");  
	} else { // is Edit
		chrome.storage.sync.get(editId, function(result) {
			var info = result[editId].split(DELIM); 
			$("#titleInput").val(info[1]); 
			$("#descriptionInput").val(info[2]);  
		});
	}
}; 

// -------------------- INIALIZE ------------------------

function initialize() { // setup init
	chrome.storage.sync.set({
		"state" : "initialized!", // it won't happen again 
		"current" : "0", // initialize current
		// IDEAS
		"ideaList" : "1, 2", 
		"1" : "1" + DELIM + "Transit Alarm" + DELIM + "A simple Android application that gives you customizable alarms before your stop (found be geofence).", 
		"2" : "2" + DELIM + "Virtual Shopper" + DELIM + "Ever wanted to try on the clothes you were going to buy? Do it easily with 3D modelling, and basic inputs that create a 3D avatar for your person.",
		// PAGES 
		"pageList" : "-1, -2, -3, -4, -5", 
		"-1" : "-1" + DELIM + "Google Search" + DELIM + "https://www.google.ca/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=ideasearcher&*", 
		"-2" : "-2" + DELIM + "Google Play Store" + DELIM + "https://play.google.com/store/search?q=ideasearcher&c=apps&hl=en", 
		"-3" : "-3" + DELIM + "Github" + DELIM + "https://github.com/search?utf8=%E2%9C%93&q=ideasearcher", 
		"-4" : "-4" + DELIM + "Reddit/sideproject" + DELIM + "https://www.reddit.com/r/SideProject/search?q=ideasearcher&restrict_sr=on&sort=relevance&t=all", 
		"-5" : "-5" + DELIM + "Wikipedia" + DELIM + "https://en.wikipedia.org/w/index.php?search=ideasearcher&title=Special:Search&profile=default&fulltext=1&searchToken=cme8739o4gak9ey4e48urylzr",
		// SETTINGS
		"settingList" : "1, -1, -2, -3" 
	
	}, function() {
		setup(); 
	}); 
}

// ------------------- RUN CODE --------------------------

document.getElementById('headerAdd').onclick = function() {
	// addIdea("3|||ALAN|||wow so cool"); 
	changeDiv("topDiv", "editDiv"); 
	openEdit(true, "0"); // not new 
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
					console.log("initialized!"); 
					console.log("ideaList: " + result["ideaList"]); 
					console.log("3: " + result["3"] ); 
					console.log("4: " + result["4"]);
				}); 
				chrome.storage.sync.clear(); 
				initialize(); 
				// setup(); 
				break; 
		}
	}); 
});




