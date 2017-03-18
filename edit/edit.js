


var titleInput = $("#titleInput"); 
var descriptionInput = $("#descriptionInput"); 

$("#submitForm").onsubmit = function() {
	var title = titleInput.value(); 
	titleInput.innerHTML = "Please Enter Title"; 
}