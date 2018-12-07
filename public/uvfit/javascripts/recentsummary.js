var map = null;

function getRecentActivities() {
    
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivitySummary);
    xhr.responseType = "json";   
    xhr.open("GET", "/activities/recent/7");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

// calculates and shows the user’s total activity duration, total calories burned,
// and total UV exposure in the past 7 days.
function displayActivitySummary() {
    document.getElementById("main").style.display = "block";
	// debug
	console.log("response: " + this.response.activities);
	console.log("status: " + this.status);
   
   if (this.status === 200) {
       var totalUV = 0;
       var totalDuration = 0;
	   var totalCals = 0;
   
	   // If there's at least one activity, print data
	   if (this.response.activities.length > 0) {
           // Get each activity from the response and post its data to relevant span in summaryview.html
           for (let index = 0; index < this.response.activities.length; index++) {
			   // get duration and add to totalDuration
			   var duration = this.response.activities[index].duration;
			   totalDuration += duration;	

			   // calculate calories burned and add to totalCals
			   var calsBurned = 0;
			   var kiloSpeed = this.response.activities[index].speed * 3.6;
			   switch(activityType) {
				   case "walking":
					   // CB = [0.0215 x KPH3 - 0.1765 x KPH2 + 0.8710 x KPH + 1.4577] x WKG x T
					   calsBurned = (0.0215 * (kiloSpeed)^3 - 0.1765 * (kiloSpeed)^2 + 0.8170 * kiloSpeed + 1.4577) * (68.038) * (duration / 60);
					   break;
				   case "running":
					   // Kcal/Min ~= respiratoryExchangeRatio * massKg * VO2 / 1000
					   // VO2 = (0.2 * metersMin) + 3.5
					   var VO2 = (0.2 * speed) + 3.5;
					   calsBurned = (4.86 * 68.038 * VO2) * duration;
					   break;
				   case "biking":
					   // calsBurned = WKG * 6 * 60/duration
					   calsBurned = ((68.038) * 6 * 60) / duration;
					   break;
				   default:
					   calsBurned = 0;
					   break;
			   }
			   totalCals += calsBurned;

			   // get UV exposure and add to totalUV
			   totalUV += this.response,activities[index].uv;
           }
	   }
	   	 // display total counts in respective spans
	     document.getElementById("totalDuration").textContent = totalDuration;
	     document.getElementById("totalUV").textContent = totalUV;
	     document.getElementById("totalCals").textContent = totalCals;
         
	   // if there are no activities reported, show errorDiv
	   if(this.response.activities.length == 0) {
		   var errorMessage = "No activites have been reported in the last 7 days."
		   document.getElementById("errorDiv").textContent = errorMessage;
    	   document.getElementById("errorDiv").style.display = "inline-block";
		   console.log(errorMessage);
	   }

	   // display activityReport in recentactivities.html
       //  document.getElementById("activityText").textContent = activityReport;
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
