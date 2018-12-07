var map = null;

function getActivitiesList() {

    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivitiesList);
    xhr.responseType = "json";   
    xhr.open("GET", "/activities/recent/30"); // should get all activities
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayActivitiesList() {
    console.log("Inside displayActivitiesList function, ajax response loads.");
    console.log(this.response);
    console.log(this.status);
    document.getElementById("main").style.display = "block";
   
   if (this.status === 200) {
	   var latitude = 0.0;
	   var longitude = 0.0;
       var uv = 0;
       var speed = 0;
	   var date = "00-00-00"; 
	   var duration = 0;
	   var activityType = "";
       var activityReport = "No activities have been reported in the last 30 days.";
   
	   // If there's at least one activity, print data
	   if (this.response.activities.length > 0) {
		   // TODO: Are these actually neccesary?
	      var latitude = this.response.activities[this.response.activities.length-1].latitude;
	      var longitude = this.response.activities[this.response.activities.length-1].longitude;
		  var date = this.response.activities.date;
          
	      // Report number of activities
	      activityReport = this.response.activities.length +
		                  " activites have been uploaded in the last 30 days. The most recent activity  was " +
		                  this.response.activities[this.response.activities.length-1].date;

           // Get each activity from the response and post its data to div of id #activitiesList
           for (let index = 0; index < this.response.activities.length; index++) {
			   // Template
			   // <div class="card-content white-text">
			   //<span class="card-title">Card Title</span>
			   //<p>I am a very simple card. I am good at containing small bits of information.
			   //I am convenient because I require little markup to use effectively.</p>
			   //</div>
			   //<div class="card-action">
			   //<a href="#">This is a link</a>
			   //<a href="#">This is a link</a>
			   //</div>
			   
			   var card = document.createElement("div");
			   card.classList.add("card");
			   card.classList.add("red");
			   card.classList.add("darken-1");
			   var title = document.createElement("span");
			   title.classList.add("card-title");
			   title.textContent = "Activity #" + (index + 1);
			   var contentDiv = document.createElement("div");
			   contentDiv.classList.add("card-content");                
			   contentDiv.classList.add("white-text");
			   var entry = document.createElement("p");

			   var activityType = this.response.activities[index].activityType;
			   var duration = this.response.activities[index].duration;
			   var speed = this.response.activities[index].speed;
			   entry.textContent = "Activity Type: "+ activityType + "\n";
			   entry.textContent += "Date: " + this.response.activities[index].date + "\n";
			   entry.textContent += "Duration: " + duration + " minutes" + "\n";
			   entry.textContent += "Latitude: " + this.response.activities[index].latitude + "\n";
			   entry.textContent += "Longitutde: " + this.response.activities[index].longitude + "\n";
			   entry.textContent += "UV Exposure: " + this.response.activities[index].uv + "\n";
			   entry.textContent += "Speed: " + speed + " m/s"  + "\n";

			   // calculate calories burned
			   var calsBurned = 0;
			   var kiloSpeed = this.response.activities[index].speed * 3.6;
			   switch(activityType) {
				   case "walking":
					   // CB = [0.0215 x KPH3 - 0.1765 x KPH2 + 0.8710 x KPH + 1.4577] x WKG x T
					   calsBurned = (0.0215 * (kiloSpeed)^3 - 0.1765 * (kiloSpeed)^2 + 0.8170 * kiloSpeed + 1.4577) * (68.038) * duration/60;
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
			   entry.textContent += "Calories burned: " + calsBurned + " cals" + "\n";

			   contentDiv.appendChild(title);
			   contentDiv.appendChild(entry);
				
			   var cardAction = document.createElement("div");
			   cardAction.classList.add("card-action");
			   var selectActivity = document.createElement("a");
			   selectActivity.classList.add("activity" + (index + 1));
			   console.log("in displayActivitesList(), class added is " + selectActivity.classList);
			   selectActivity.textContent = "View this activity in detail.";
			   cardAction.appendChild(selectActivity);

			   card.appendChild(contentDiv);	
			   card.appendChild(cardAction);	

				//debug
				console.log("Latitude: " + this.response.activities[index].latitude);
				console.log("Entry: " + entry.textContent);

                // add nodes to #activitiesList div
                document.getElementById("activitiesList").appendChild(card);
           }
	   }
         // display activityReport in recentactivities.html
         document.getElementById("errorDiv").textContent = activityReport;
    }
    else if (this.status === 401) {
        window.localStorage.removeItem("authToken");
        window.location = "signin.html";
    }
    else {
		// the date param is wrong
		console.log("The day provided is greater than 30 or less than 1.");
    }    
}

// Sets up the handlers and calls
function initList() {
    // Allow the user to refresh by clicking a button.
    document.getElementById("refreshRecent").addEventListener("click", getActivitiesList);
    getActivitiesList();
}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
    initList();
});
