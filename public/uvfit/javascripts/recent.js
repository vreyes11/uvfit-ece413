var map = null;

function getRecentActivities() {
    
    console.log("Inside getRecentActivities function, ajax response sent.");

    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayMostRecentActivity);
    xhr.responseType = "json";   
    xhr.open("GET", "/activities/recent/10");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayMostRecentActivity() {
    console.log("Inside displayMostRecentActivity function, ajax response loads.");
    console.log(this.response);
    console.log(this.status);
    document.getElementById("main").style.display = "block";
   
   if (this.status === 200) {
	   var latitude = 0.0;
	   var longitude = 0.0;
       var uv = 0;
       var speed = 0;
       var activityReport = "No activities have been reported in the last ten days.";
   
	   // If there's at least one activity, print data
	   if (this.response.activities.length > 0) {
	      var latitude = this.response.activities[this.response.activities.length-1].latitude;
	      var longitude = this.response.activities[this.response.activities.length-1].longitude;
		  var uv = this.response.activities.uv;
          var speed = this.response.activities.speed;
          
	      // Report number of activities
	      activityReport = this.response.activities.length +
		                  " activites have been uploaded in the last ten days. The most recent activity (shown above) was " +
		                  this.response.activities[this.response.activities.length-1].date;

           // Get each activity from the response and post its data to div of id #activityText in recentactivities.html
           for (let index = 0; index < this.response.activities.length; index++) {
                var entry = document.createElement("div");
                var title = document.createElement("h2");
                entry.appendChild(title);
                title.textContent = "Activity: " + index;
                entry.textContent = "Latitude: " + this.response.activities[index].latitude + "\n";
                entry.textContent += "Longitutde: " + this.response.activities[index].longitude + "\n";
                entry.textContent += "UV Exposure: " + this.response.activities[index].uv + "\n";
                entry.textContent += "Speed: " + this.response.activities[index].speed + "\n";
		entry.classList.add("card-content");                
		entry.classList.add("white-text"); 
 
		//debug
		console.log("Latitude: " + this.response.activities[index].latitude);
		console.log("Entry: " + entry.textContent);

                // add nodes to #activityText div
                document.getElementById("recentActivities").appendChild(entry);
           }
	   }
         // display activityReport in recentactivities.html
         document.getElementById("activityText").textContent = activityReport;
    }
    else if (this.status === 401) {
        window.localStorage.removeItem("authToken");
        window.location = "signin.html";
    }
    else {
    	// ?
        //activityText.innerHTML = "Error communicating with server.";
    }    
}

// Sets up the handlers and calls
function initRecent() {
    // Allow the user to refresh by clicking a button.
    document.getElementById("refreshRecent").addEventListener("click", getRecentActivities);
    getRecentActivities();
}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
    initRecent();
});
