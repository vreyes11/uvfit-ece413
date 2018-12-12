var map = null;

function getActivitiesList() {

    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivitiesList);
    xhr.responseType = "json";   
    xhr.open("GET", "/activities/all"); // should get all activities
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayActivitiesList() {
    console.log("Inside displayActivitiesList function, ajax response loads.");
    console.log(this.response);
    console.log(this.status);
    document.getElementById("main").style.display = "block";
   
   if (this.status === 200) {
       var activityReport = "No activities have been reported.";
   
	   // If there's at least one activity, print data
	   if (this.response.activities.length > 0) {
		  var date = this.response.activities.date;
          
	      // Report number of activities
	      activityReport = this.response.activities.length +
		                  " activites have been uploaded. The most recent activity  was " +
		                  this.response.activities[this.response.activities.length-1].date;

           // Get each activity from the response and post its data to div of id #activitiesList
           for (let i = 0; i < this.response.activities.length; i++) {
			   // calculate average speed 
			   var sum = 0;
			   for(let j = 0; j < this.response.activities[i].speed.length; j++ ) {
					sum += parseInt(this.response.activities[i].speed[j], 10);	
			   }
			   console.log(sum);
			   var avgSpeed = sum / this.response.activities[i].speed.length; // use to calculate calories

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
			   var activityID = parseInt(this.response.activities[i].activityID, 10);
			   title.textContent = "Activity #" + activityID;
			   var contentDiv = document.createElement("div");
			   contentDiv.classList.add("card-content");                
			   contentDiv.classList.add("white-text");
			   var entry = document.createElement("p");

			   var activityType = this.response.activities[i].activityType;
			   var duration = 0;
			   if(this.response.activities[i].duration != null) {
				   duration = parseInt(this.response.activities[i].duration, 10);
			   }
			   entry.innerHTML = "Activity Type: "+ activityType + "<br>";
			   entry.innerHTML += "Date: " + this.response.activities[i].date + "<br>";
			   entry.innerHTML += "Duration: " + duration + " seconds" + "<br>";
			
			   if( this.response.activities[i].loc != null ) {
				   entry.innerHTML += "Starting latitude: " + this.response.activities[i].loc[1] + "<br>";
				   entry.innerHTML += "Starting longitude: " + this.response.activities[i].loc[0] + "<br>";
			   } else {
				   entry.textContent += "Starting latitude: " + "missing lat" + "<br>";
				   entry.textContent += "Starting longitude: " + "missing long" + "<br>";
			   }
			   entry.innerHTML += "UV Exposure: " + this.response.activities[i].uv[0] + "<br>";
			   entry.innerHTML += " Average Speed: " + avgSpeed + " m/s"  + "<br>";

			   // calculate calories burned
			   var calsBurned = 0;
			   var kiloSpeed = this.response.activities[i].avgSpeed * 3.6;
			   switch(activityType) {
				   case "Walking":
					   // CB = [0.0215 x KPH3 - 0.1765 x KPH2 + 0.8710 x KPH + 1.4577] x WKG x T
					   calsBurned = (0.0215 * (kiloSpeed)^3 - 0.1765 * (kiloSpeed)^2 + 0.8170 * kiloSpeed + 1.4577) * (68.038) * duration/60;
					   break;
				   case "Running":
					   // Kcal/Min ~= respiratoryExchangeRatio * massKg * VO2 / 1000
					   // VO2 = (0.2 * metersMin) + 3.5
					   var VO2 = (0.2 * avgSpeed) + 3.5;
					   calsBurned = (4.86 * 68.038 * VO2) * duration;
					   break;
				   case "Biking":
					   // calsBurned = WKG * 6 * 60/duration
					   calsBurned = ((68.038) * 6 * 60) / duration;
					   break;
				   default:
					   calsBurned = 0;
					   break;
			   }
			   entry.innerHTML += "Calories burned: " + calsBurned + " cals" + "<br>";

			   contentDiv.appendChild(title);
			   contentDiv.appendChild(entry);
				
			   var cardAction = document.createElement("div");
			   cardAction.classList.add("card-action");
			   var selectActivity = document.createElement("a");
			   selectActivity.classList.add("activity" + (i + 1));
			   console.log("in displayActivitesList(), class added is " + selectActivity.classList);
			   selectActivity.textContent = "View this activity in detail.";
			   // add click event listener to show in-depth view for each activity
			   selectActivity.addEventListener("click", showActivitySummary);
			   $(selectActivity).data("id", activityID); // jquery to add data-id to each activity
			   cardAction.appendChild(selectActivity);

			   card.appendChild(contentDiv);	
			   card.appendChild(cardAction);

				//debug
				console.log("Latitude: " + this.response.activities[i].latitude);
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
		console.log("ERROR: 132:recentList.js");
    }    
}

// NOTE: uses jquery
function showActivitySummary() {
	console.log(this);
    var activityID = $(this).data('id');
	console.log("data-id = " + activityID);
    if (activityID) {
        window.location = '/uvfit/activitysummary.html?id=' + activityID;
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
