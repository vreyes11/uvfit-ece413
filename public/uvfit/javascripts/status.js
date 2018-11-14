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
	/*$.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });*/
}

function accountInfoSuccess(data, textSatus, jqXHR) {
   $("#email").html(data.email);
   $("#fullName").html(data.fullName);
   $("#lastAccess").html(data.lastAccess);
   $("#main").show();
   
   // Add the devices to the list before the list item for the add device button (link)
   for (var device of data.devices) {
      $("#addDeviceForm").before("<li class='collection-item' id=" + device.apikey + ">ID: " +
        device.deviceId + ", APIKEY: " + device.apikey + "</li>");
   }
	for (var device of data.devices) {
		$('#' + device.apikey).each(function(i)
			{
				$(this).click(showUpdateDeviceForm);
				//FIXME:
				console.log(this);
			});
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
           $("#addDeviceForm").before("<li class='collection-item'>ID: " +
           $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "</li>")
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

// Show update device form and hide the update and device button (really a link)
function showUpdateDeviceForm() {
	$(event.target).off('click');
	$(event.target).val("");
	console.log("H!");	
	$(event.target).append("<input type='text' value=''/>"); 
	// show update and cancel buttons
	//$("#updateDevice").show();
	//$("#cancelUpdate").show();

	// append cnacel adn update buttons after li element
	$(event.target).append("<button id='updateDevice' class='waves-effect waves-light red btn'>Update</button>");	
	$(event.target).append("<button id='cancelUpdate' class='waves-effect waves-light red btn'>Cancel</button>");

	// add click event listeners to buttons
	$('#updateDevice').click(sendReqForUpdateDeviceId);
	$('#cancelUpdate').click(hideUpdateDeviceForm);
}

function hideUpdateDeviceForm() {
	$('devices li').hide();
	// TODO: Hide the input, maybe delete it
	console.log('hide');
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

