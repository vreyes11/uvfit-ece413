var map = null;

function getSelectedActivity() {
	var urlParams = new URLSearchParams(window.location.search); // may not work on all browsers
	console.log(urlParams.get('date')); // assuming /activity-summary?date=date1

   	var date = urlParams.get('date');

    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivitySummary);
    xhr.responseType = "json";   
    xhr.open("GET", "/activities?date=" + date);
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function sendReqForUpdateActivityType() {
	var activityType = $("input[name='type']:checked").val(); // get value of selected radio button
	var urlParams = new URLSearchParams(window.location.search); 
	console.log(urlParams.get('date'));
   	var date = urlParams.get('date'); // get date value from the url, needed to identify the activity

    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivityType);
    xhr.responseType = "json";   
    xhr.open("PUT", "/activity-type?date=" + date);
    xhr.setRequestHeader("x-auth", token);
    xhr.send(JSON.stringify(activityType));
}

// called after a PUT request to update the activity type
function displayActivityType() {
	hideUpdateActivityTypeForm();
	location.reload();  // re-load page
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
		
	   // TODO: Make sure these exist and are accurate
	   var initLongitude = this.response.activities.longitude[0];
	   var initLatitude = this.response.activities.latitude[0];
   
	   // If there's at least one activity, print data
	   if (this.response.activities.length > 0) {
		   // Get each activity from the response and post its data to relevant span in summaryview.html
		   for (let i = 0; i < this.response.activities.length; i++) {
			   // calculate average speed 
			   var sum = 0;
			   for(let j = 0; j < this.response.activities[i].speed.length; j++ ) {
				   sum += parseInt(this.response.activities[i].speed[j], 10);
			   }
			   console.log("sum of speeds = " + sum);
			   var avgSpeed = sum / this.response.activities[i].speed.length; // use to calculate calories

			   // get duration and add to totalDuration
			   var duration = parseInt(this.response.activities[index].duration, 10);
			   totalDuration += duration;

			   // get date
			   var date = this.response.submitTime;
			   // get activityType
			   var activityType = this.response.activityType;

			   // calculate calories burned and add to totalCals
			   var calsBurned = 0;
			   var kiloSpeed = this.response.activities[index].avgSpeed * 3.6;
			   switch(activityType) {
				   case "walking":
					   // CB = [0.0215 x KPH3 - 0.1765 x KPH2 + 0.8710 x KPH + 1.4577] x WKG x T
					   calsBurned = (0.0215 * (kiloSpeed)^3 - 0.1765 * (kiloSpeed)^2 + 0.8170 * kiloSpeed + 1.4577) * (68.038) * (duration / 60);
					   break;
				   case "running":
					   // Kcal/Min ~= respiratoryExchangeRatio * massKg * VO2 / 1000
					   // VO2 = (0.2 * metersMin) + 3.5
					   var VO2 = (0.2 * avgSpeed) + 3.5;
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
			   // TODO: I'm not sure if this should be calculating an average
			   totalUV += parseInt(this.response,activities[index].uv, 10);
           }
		   // display total counts in respective spans
		   document.getElementById("activityDate").textContent = date;
		   document.getElementById("activityType").textContent = activityType;
		   document.getElementById("totalDuration").textContent = totalDuration;
		   document.getElementById("totalUV").textContent = totalUV;
		   document.getElementById("totalCals").textContent = totalCals;

		   // Draw Google Maps screen at the initial latitude and longitude
		   map.data.setStyle(function(feature) {
			   return /** @type {google.maps.Data.StyleOptions} */({
				   icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png"
			   });
		   });
		   map = new google.maps.Map(document.getElementById('map'), {
			   center: {lat: initLatitude, lng: initLongitude},
			   zoom: 8
		   });

		   var ActivityPathCoordinates = [];
			// get the first activtiy (there should only be 1)
		   // TODO: Assumming number of lats = number of longs
		   for(let i = 0; i < this.activities[0].latitude.length; i++) {
			   let lat = this.activities[0].latitude[i];
			   let lng = this.activities[0].longitude[i];
			   activityPathCoordinates.push({lat: lat, lng: lng});
		   }
		   var activityPath = new google.maps.Polyline({
			   path: flightPlanCoordinates,
			   geodesic: true,
			   strokeColor: '#FF0000',
			   strokeOpacity: 1.0,
			   strokeWeight: 2
		   });

		   activityPath.setMap(map);

	   }
         
	   // if there are no activities reported, show errorDiv
	   if(this.response.activities.length == 0) {
		   var errorMessage = "No activites have been reported in the last 7 days."
		   document.getElementById("errorDiv").textContent = errorMessage;
    	   document.getElementById("errorDiv").style.display = "inline-block";
		   console.log(errorMessage);
	   }
    
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

// Show add update activtiy type form and hide the update button (really a link)
function showUpdateActivityTypeForm() {
   $("#updateActivityType").hide();             // Hide the update link
   $("#updateActivityTypeForm").slideDown();  // Show the update activtiy type form
}

// Hides the update activity type form and shows the update link
function hideUpdateActivityTypeForm() {
   $("#updateActivityType").show();  // Show the update activity type link
   $("#updateActivityTypeForm").slideUp();  //  Hide the form
   $("#error").hide();
}

// Sets up the handlers and calls
function init() {
    getSelectedActivity();
	hideUpdateActivityTypeForm();
	$("#updateActivityType").click(showUpdateActivityTypeForm); // show the update activity form, link
	$("#updateType").click(sendReqForUpdateActivityType); // send PUT request to update the activity type, button
	$("#cancelType").click(hideUpdateActivityTypeForm); // hide the update activity from, button
}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
    init();
});
