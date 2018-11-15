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
        type: 'POST',
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

function accountInfoSuccess(data, textSatus, jqXHR) {
   $("#email").html(data.email);
   $("#fullName").html(data.fullName);
   $("#lastAccess").html(data.lastAccess);
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
	// FIXME: Assuming less than 100 devices
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
		   
		   //TODO: make a new device clickable without refreshing the page
			$('#device0').click(showUpdateDeviceForm);
		   
           hideAddDeviceForm();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
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
   $("#registerDevice").click(registerDevice);   
   $("#cancel").click(hideAddDeviceForm);   
});

