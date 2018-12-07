function sendPasswordReqForUpdate() {
	var passwordConfirm = document.getElementById("passwordConfirm").value;
	var passwordOld = document.getElementById("passwordOld").value;
	var passwordNew = document.getElementById("passwordNew").value;

	// FIXME: More thorough validation should be performed here. 
	if (passwordOld != passwordConfirm) {
		var passwordErrorDiv = document.getElementById('passwordError');
		passwordErrorDiv.style.display = "block";
		passwordErrorDiv.innerHTML = "<p>Password does not match.</p>";
		return;
	}
	// check for strong password
	// 1. At least 1 upper case, 1 lower case, 1 number/special char, greater than 6 chars
	var re = /(?=^.{6,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
	if(!re.test(passwordNew)) {
		var passwordErrorDiv = document.getElementById('passwordError');
		passwordErrorDiv.style.display = "block";
		passwordErrorDiv.innerHTML = "<p>Password is not a strong password. Match the criteria  and try again.</p>";
		return;	
	}

	var xhr = new XMLHttpRequest();
	var token = window.localStorage.getItem("authToken");
	xhr.addEventListener("load", updateResponse);
	xhr.responseType = "json";
	xhr.open("PUT", '/users/update');
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("x-auth", token);
	xhr.send(JSON.stringify({passwordNew:passwordNew}));
}

function sendNameReqForUpdate() {
  var updateName = document.getElementById("updateName").value;
		
  // FIXME: More thorough validation should be performed here. 
		
  var xhr = new XMLHttpRequest();
  var token = window.localStorage.getItem("authToken");
  xhr.addEventListener("load", updateResponse);
  xhr.responseType = "json";
  xhr.open("PUT", '/users/update');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.setRequestHeader("x-auth", token);
  xhr.send(JSON.stringify({fullName: updateName}));
}

function sendEmailReqForUpdate() {
  var email = document.getElementById("email").value;
		
  // email validation done here
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(!re.test(email)) { // if invalid email, return with error message
		var emailErrorDiv = document.getElementById('emailError');
		emailErrorDiv.style.display = "block";
		emailErrorDiv.innerHTML = "<p>Email is invalid. Please try a valid email.</p>";
		return;
	}

  var xhr = new XMLHttpRequest();
  var token = window.localStorage.getItem("authToken");
  xhr.addEventListener("load", updateResponse);
  xhr.responseType = "json";
  xhr.open("PUT", '/users/update');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.setRequestHeader("x-auth", token);
  xhr.send(JSON.stringify({email: email}));
}

function updateResponse() {
	// clear inputs
	document.getElementById("updateName").value = "";
	document.getElementById("updateEmail").value = "";
	document.getElementById("passwordNew").value = "";
	document.getElementById("passwordOld").value = "";
	document.getElementById("passwordConfirm").value = "";

	// 200 is the response code for a successful GET request
	console.log(this.response);
	console.log(this.status);
	if (this.status === 201) {
		// if email is changed, this.response.token should exist
		if(this.response.token) {
     		window.localStorage.setItem("authToken", this.response.token);
		}

		if (this.response.success) {
			var successMessage = "<ol class='successMessage green-text'>";
			successMessage += "<li>User account information succesfully updated.</li>";
			successMessage += "</ol>";
			
			// Update the success div in the webpage and make it visible
			var successDiv = document.getElementById('success');
			successDiv.style.display = "block";
			successDiv.innerHTML = successMessage;
		} 	
		else {
			responseHTML += "<ol class='ServerResponse'>";
			for (key in this.response) {
				responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
			}
			responseHTML += "</ol>";
			// Update the error div in the webpage and make it visible
			var errorDiv = document.getElementById('error');
			error.style.display = "block";
			error.innerHTML = responseHTML;
		}
	}
	else {
		// Use a span with dark red text for errors
		responseHTML = "<span class='red-text text-darken-2'>";
		responseHTML += "Error: " + this.response.error;
		responseHTML += "</span>"
		
		// Update the error div in the webpage and make it visible
		var errorDiv = document.getElementById('error');
		error.style.display = "block";
		error.innerHTML = responseHTML;
	}

	
}

document.addEventListener("DOMContentLoaded", function() {
	// Each updated information has its own http request function
	document.getElementById("updatePassword").addEventListener("click", sendPasswordReqForUpdate);
	document.getElementById("updateFullName").addEventListener("click", sendNameReqForUpdate);
	document.getElementById("updateEmail").addEventListener("click", sendEmailReqForUpdate);
});
