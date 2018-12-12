function sendReqForAccountInfo() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}

function sendReqForUpdateDeviceId() {
	// extract id device number from clicked li element's id
	// ex: if id="device2", then var deviceNum = 2
	var deviceNum = event.target.id.match(/\d+/)[0];
	var deviceId = $('#updateInput' + deviceNum).val();
	
	// get APIkey from device li
	// NOTE: Depends on APIKey being 32 characters
	var apikey = $('#device' + deviceNum).text().match(/[\w\d]{32}/)[0];

    $.ajax({
        url: '/devices/update',
        type: 'PUT',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { deviceId: deviceId, apikey: apikey }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Update device to the device list
		console.log(data);
           hideAddDeviceForm();
		   window.location = "home.html";
		   
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

function sendReqForDeleteDevice() {
	// extract id device number from clicked li element's id
	// ex: if id="device2", then var deviceNum = 2
	var deviceNum = event.target.id.match(/\d+/)[0];
	
	// get APIkey from device li
	// NOTE: Depends on APIKey being 32 characters
	var apikey = $('#device' + deviceNum).text().match(/[\w\d]{32}/)[0];

    $.ajax({
        url: '/devices/delete',
        type: 'DELETE',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { apikey: apikey }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           hideAddDeviceForm();
		   window.location = "home.html";
		   
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

function accountInfoSuccess(data, textStatus, jqXHR) {
   $("#email").html(data.email);
   $("#fullName").html(data.fullName);
   $("#lastAccess").html(data.lastAccess);
   $("#uvThreshold").html(data.uvThreshold);
   $("#main").show();
   
   // Add the devices to the list before the list item for the add device button (link)
   var devicesIndex = 0;
   for (var device of data.devices) {
      $("#addDeviceForm").before("<li class='collection-item' id=device" + devicesIndex + ">ID: " +
        device.deviceId + ", APIKEY: " + device.apikey + "</li>");

	   // append cancel and update buttons and input after li element	
	   $('#device' + devicesIndex).after("<button id='updateDevice" + devicesIndex + "' class='waves-effect waves-light red btn'>Update</button>");
	   $('#device' + devicesIndex).after("<button id='cancelUpdate" + devicesIndex + "' class='waves-effect waves-light red btn'>Cancel</button>");
	   $('#device' + devicesIndex).after("<button id='deleteId" + devicesIndex + "' class='waves-effect waves-light red btn'>Remove device</button>");
	    

	   $('#device' + devicesIndex).after("<div input-field col s12 id='updateDiv" + devicesIndex + "'>" +  
		   										"<input id='updateInput" + devicesIndex + "' type='text' value=''>" + 
	   											"<label for='updateInput" + devicesIndex + "'>New device id</label>" + 
	   										"</div>"); 
	   // hide elements created above
	   $('#updateInput' + devicesIndex).hide();
	   $('#updateDevice' + devicesIndex).hide();
	   $('#cancelUpdate' + devicesIndex).hide();
	   $('#updateDiv' + devicesIndex).hide();
	   $('#deleteId' + devicesIndex).hide();
	   	
	   // register click event listeners on li and buttons/input
	   $('#device' + devicesIndex).click(showUpdateDeviceForm);
	   $('#updateDevice' + devicesIndex).click(sendReqForUpdateDeviceId);
	   $('#cancelUpdate' + devicesIndex).click(hideUpdateDeviceForm);
	   $('#deleteId' + devicesIndex).click(sendReqForDeleteDevice);

	   devicesIndex++;
   }
    // done after account information GET
	sendUVThreshold(); // sends to device
}
// Show add update threshold form and hide the update threshold button (really a link)
function showUpdateThresholdForm() {
   $("#threshold").val("");           // Clear the input for the new threshold
   $("#updateUV").hide();             // Hide the update link
   $("#updateThresholdForm").slideDown();  // Show the update threshold form
}

// Hides the update threshold form and shows the update threshold link
function hideUpdateThresholdForm() {
   $("#updateUV").show();  // Hide the add device link
   $("#updateThresholdForm").slideUp();  // Show the add device form
   $("#error").hide();
}

function showUpdateDeviceForm() {
	// extract id device number from clicked li element's id
	// ex: if id="device2", then var deviceNum = 2
	var deviceNum = event.target.id.match(/\d+/)[0];

	// show cancel and update button and updateInput elements
	// for the device li element that was clicked
   	$('#updateInput' + deviceNum).slideDown();
   	$('#updateDevice' + deviceNum).css('display', 'block');
   	$('#cancelUpdate' + deviceNum).slideDown();
   	$('#updateDiv' + deviceNum).slideDown();
	$('#deleteId' + deviceNum).slideDown();
	
}

function hideUpdateDeviceForm() {
	// extract id device number from clicked li element's id
	// ex: if id="device2", then var deviceNum = 2
	var deviceNum = event.target.id.match(/\d+/)[0];
	console.log("In hideUpdate: " + deviceNum);
	
	// hide buttons and input (#updateInput)
	$("#cancelUpdate" + deviceNum).hide();
	$("#updateDevice" + deviceNum).hide();
	$('#deleteId' + deviceNum).hide();
	$("#updateDiv" + deviceNum).slideUp();
	
	// re-enable click event listener to deviceId div
	// FIXME: Assuming less than 10 devices
	for(var i = 0; i < 10; i++) {
		$('#device' + i).on("click", showUpdateDeviceForm);
	}	
}

function accountInfoError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken 
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("signin.html");
   } 
   else {
     $("#error").html("Error: " + status.message);
     $("#error").show();
   } 
}
function sendReqForUpdateUVThreshold() {
   var newThreshold = $("#threshold").val();
   var input = parseInt(newThreshold, 10);
   var re = /^[0-9]*$/;	
	
	if(!re.test(newThreshold.toString())) {
		$("#error").html("Please match the threshold criteria and try again.")
		$("#error").show();
		return;
	}
    $.ajax({
        url: '/users/update/uv-threshold',
        type: 'PUT',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { uvThreshold: newThreshold }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
	       // update threshold on website
		   $("#uvThreshold").html(data["uvThreshold"]);
		   location.reload(); // Is location.reload() neccesary?	
           hideUpdateThresholdForm();
		   sendUVThreshold(); // sends to device
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Registers the specified device with the server.
function registerDevice() {
    $.ajax({
        url: '/devices/register',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { deviceId: $("#deviceId").val() }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           $("#addDeviceForm").before("<li class='collection-item' id='device0'>ID: " +
           $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "</li>")
		   
			$('#device0').click(showUpdateDeviceForm);
			location.reload();
		   
           hideAddDeviceForm();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Sends UV Index Threshold to device
function sendUVThreshold() {
	var uvThreshold = $("#uvThreshold").html();
	console.log("uvThreshold is " + uvThreshold);
	var deviceID = "2f0034000f47363336383437";
	var accessToken = "377a0c9a008dbe94af700e780b313b18ec335f86"; // CHANGE accessToken here.
	var functionName = "setUV";

    $.ajax({
		url: 'https://api.particle.io/v1/devices/' + deviceID +'/' + functionName +
		'?access_token=' + accessToken + '&command=' + uvThreshold,
        type: 'POST',
        data:'&command=' + uvThreshold, // data sent here
		responseType: 'json',
        success: function (data) {
        	console.log("POST succesful, UV threshold sent to device. ");
		}, 
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
			console.log("ERROR: sendUVThreshold() in status.js");
			console.log(response);
        }

    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
   $("#deviceId").val("");           // Clear the input for the device ID
   $("#addDeviceControl").hide();    // Hide the add device link
   $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
   $("#addDeviceControl").show();  // Hide the add device link
   $("#addDeviceForm").slideUp();  // Show the add device form
   $("#error").hide();
}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to 
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("signin.html");
   }
   else {
      sendReqForAccountInfo();
   }

	// Register event listeners
	$("#addDevice").click(showAddDeviceForm);
	$("#cancel").click(hideAddDeviceForm);   

	$("#updateUV").click(showUpdateThresholdForm);
	$("#cancelThreshold").click(hideUpdateThresholdForm);
	$("#updateThreshold").click(sendReqForUpdateUVThreshold);
	hideUpdateThresholdForm();

	$("#registerDevice").click(registerDevice);   
});

