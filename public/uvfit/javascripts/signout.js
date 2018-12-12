document.addEventListener("DOMContentLoaded", function() {
	var signOuts = document.querySelectorAll('#signout');
	for (var i = 0; i < signOuts.length; i++) {
		signOuts[i].addEventListener('click', function() {
			window.localStorage.removeItem("authToken");
			window.location = "signin.html";
		});
	}
/*   document.getElementById('signout').addEventListener('click', function() {
      window.localStorage.removeItem("authToken");
      window.location = "signin.html";
   });*/
});
