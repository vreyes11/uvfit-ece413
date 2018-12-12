var express = require('express');
var router = express.Router();

var fs = require('fs');
var jwt = require("jwt-simple");
var Device = require("../models/device");
var Activity = require("../models/activities");
var User = require("../models/users");

// Secret key for JWT
var secret = fs.readFileSync(__dirname + '/../jwtkey').toString();
var authenticateRecentEndpoint = true;

// variables to assign activtyType based on speed parameter
var upperWalkingSpeed = 1.5;
var lowerBikingSpeed = 4.47; // 10 mph

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }
   
    var authToken = req.headers["x-auth"];
   
    try {
        var decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}

// POST: Adds an activity to the database
// Authentication: APIKEY. The device reporting must have a valid APIKEY
// recieves deviceID, APIKey, and submitTime, and initial Latititude and Longitude
router.post("/init", function(req, res) {
    var responseJson = {
        success : false,
        message : "",
    };

	console.log("Recieved request.");
	console.log("The parameters are as follows: activityID: " + req.body.activityID);

    // Ensure the POST data include required properties    
    
    //
	if( !req.body.hasOwnProperty("activityID") ) {
        responseJson.message = "Request missing activityID parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.message = "Request missing apikey parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
<<<<<<< HEAD
    /*if( !req.body.hasOwnProperty("longitude") ) {
=======
   /* if( !req.body.hasOwnProperty("longitude") ) {
>>>>>>> dc1b7be9a2fb56d5be0f3fbae44c9ec573801309
        responseJson.message = "Request missing longitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }*/
    
    if( !req.body.hasOwnProperty("time") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
	if( !req.body.hasOwnProperty("totalTime") ) {
        responseJson.message = "Request missing totalTime parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
	

    // Find the device and verify the apikey                                           
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
            return res.status(201).send(JSON.stringify(responseJson));
        }
        
        if (device.apikey != req.body.apikey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
            return res.status(201).send(JSON.stringify(responseJson));
        }

		console.log("BEFORE: var activity = new Activity()");

		console.log("req.body.activityID = " + req.body.activityID);
               
             //////////////////////////////////////////////////////////////////////
             // New activity
             /////////////////////////////
                 // Create a new activity and save the activity to the database
                 var activity = new Activity({
		     		 activityID: req.body.activityID,
                     loc: [ req.body.longitude, req.body.latitude ],
					 duration:   req.body.totalTime, // must be overwritten by sending duration with the last data point to /add
                     submitTime: Date.now(),
                 });				
                 responseJson.message = "New activity recorded.";
            // }                

			 console.log("BEFORE: activity.save()");
             
		// Save the activity data. 
             activity.save(function(err, newActivity) {
                 if (err) {
					 console.log("ERROR: in saving data in db. " + err);
                     responseJson.status = "ERROR";
                     responseJson.message = "Error saving data in db." + err;
                     return res.status(201).send(JSON.stringify(responseJson));
                 }
				
				 console.log("Activity (supposedly) saved to db.");
                 
				 responseJson.success = true;
                 return res.status(201).send(JSON.stringify(responseJson));
           // });
			 console.log("AFTER: activity.save()");

         });  
    });
});

// POST: Updates data to an activity to the database
// Authentication: APIKEY. The device reporting must have a valid APIKEY

// TODO: Device must send the duration in minutes on the last data point HERE.
router.post("/add", function(req, res) {
    var responseJson = {
        success : false,
        message : "",
    };
    
	if( !req.body.hasOwnProperty("activityID") ) {
        responseJson.message = "Request missing activityID parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
	
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.message = "Request missing apikey parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.message = "Request missing longitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("time") ) {
        responseJson.message = "Request missing time parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("uv") ) {
        responseJson.message = "Request UV Exposure parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.message = "Request speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

	console.log("Update activity");
	console.log("activity ID = " + req.body.activityID);
	console.log("uv = " + req.body.uv);
	console.log("speed = " + req.body.speed);
	console.log("lat = " + req.body.latitude);
	console.log("long = " + req.body.longitude);
    
	// assign activityType based on the speed parameter
	// change the range above
	var activityTypeString = "";
	if( req.body.speed <= upperWalkingSpeed ) {
		activityTypeString = "Walking";
	} else if( req.body.speed > upperWalkingSpeed && req.body.speed <= lowerBikingSpeed ) {
		activityTypeString = "Running";
	} else {
		activityTypeString = "Biking";
	}
	
	// Make the data point from parameters
	var point = [[ req.body.longitude, req.body.latitude ]];
	

    // Find the device and verify the apikey                                           
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device === null) {
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
            return res.status(201).send(JSON.stringify(responseJson));
        }
        
        if (device.apikey != req.body.apikey) {
            responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
            return res.status(201).send(JSON.stringify(responseJson));
        }
				
		// Update activity arrays here.
		if(!req.body.duration) {
			Activity.update(
				{ activityID: req.body.activityID },
				{ "$set": { "activityType": activityTypeString } },
				{ "$push": { "loc": point, "uvExposure": req.body.uv, "speed": req.body.speed, "submitTime": req.body.time}}).exec(function(err, activity) {
					if(err) {
						console.log(err);
						responseJson.message = err;
						responseJson.success = false;
						res.status(500).send(responseJson);
					} else {	
						console.log("Activity (supposedly) updated to db.");
						
						responseJson.message = "Activity successfuly updated.";
						responseJson.success = true;
						res.status(200).send(responseJson);
					}

				});
			
		} 
		else {
			Activity.update(
				{ activityID: req.body.activityID },
				{ "$set": { "activityType": activityTypeString, "duration": req.body.duration  }},
				{ "$push": { "loc": point, "uvExposure": req.body.uv, "speed": req.body.speed, "submitTime": req.body.time}}).exec(function(err, activity) {
					if(err) {
						console.log(err);
						responseJson.message = err;
						responseJson.success = false;
						res.status(500).send(responseJson);
					} else {
						responseJson.message = "Activity successfuly updated.";
						responseJson.success = true;
						res.status(200).send(responseJson);
					}

				});

		}
	});

});

// GET: Returns all activities submitted by the device
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/all", function(req, res) {
    var responseJson = {
        success: true,
        message: "",
        activities: [],
    };
    
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
	// retrieve all activities
    Activity.find( {}, function(err, allActivities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(400).send(JSON.stringify(responseJson));
		} else {
			responseJson.success = true;
			var index = 1;
			for(var activity of allActivities) {
				if(index == activity.activityID) {
					index++; // first matches with activityID = 1, then the next match will be when the activity is activityID = 2, etc
					responseJson.activities.push({ 
						activityID: activity.activityID,
						loc: activity.loc, // [ long, lat ]
						uv: activity.uvExposure, // same
						speed: activity.speed,  // same
						date: activity.submitTime, // same 
						duration: activity.duration,
						activityType: activity.activityType
					});

				}
			}
		}
		res.status(200).json(responseJson)
	
	});
    
});

// GET: Returns all activities first submitted in the previous specified number of days
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/recent/:days", function(req, res) {
    var days = req.params.days;
    
    var responseJson = {
        success: true,
        message: "",
        activities: [],
    };
    
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
    // Check to ensure the days is between 1 and 30 (inclusive), return error if not
    if (days < 1 || days > 30) {
        responseJson.success = false;
        responseJson.message = "Invalid days parameter.";
        return res.status(400).json(responseJson);
    }
    
    // Find all activities reported in the specified number of days
    var recentActivitiesQuery = Activity.find({
        "submitTime": 
        {
            $gte: new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)))
        }
    }).sort({ "date": -1 });
    
    
    recentActivitiesQuery.exec({}, function(err, recentActivities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(400).send(JSON.stringify(responseJson));
        }
        else { 
			var numRecentActivities = 0;
			if(recentActivities) {
				var index = 1;
				for (var activity of recentActivities) {
					//console.log(activity.activityID); // debug to show activityID order in database
					if(index == activity.activityID) {
						index++; // to make sure that only the first of a series of data points of activityID are sent, this is the updated one
						// Add activity data to the response's activities array
						numRecentActivities++;
						responseJson.activities.push({
							activityID: activity.activityID,
							loc: activity.loc, // [ long, lat ]
							uv: activity.uvExposure, // send whole uv array
							speed: activity.speed, // send whole speed array
							date: activity.submitTime[0],
							duration: activity.duration,
							activityType: activity.activityType
						});
					}
				}
				responseJson.message = "In the past " + days + " days, " + numRecentActivities + " UVFit activities have been submitted.";
				return res.status(200).send(JSON.stringify(responseJson));
			
			} else {
				responseJson.message = "In the past " + days + " days, " + numRecentActivities + " UVFit activities have been submitted.";
				return res.status(200).send(JSON.stringify(responseJson));
			}
        }
    })
});

// GET: Returns the activity specified by the lncluded date parameter
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/get/:date", function(req, res) {
    var date = req.params.date;
    
    var responseJson = {
        success: true,
        message: "",
        activities: [],
    };
    
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
   // find the activity with the specified date
	var query = {
		"submitTime" : date
	};

	Activity.find(query, function(err, allActivities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(400).send(JSON.stringify(responseJson));
		} else {
			responseJson.success = true;
			responseJson.message = "Activity found with parameter date = " + date;
			for(var activity of allActivities) {
				responseJson.activities.push({ 
					loc: activity.loc, // [ long, lat ]
                    uv: activity.uvExposure, // same
                    speed: activity.speed,  // same
                    date: activity.submitTime, // same 
					duration: activity.duration,
					activityType: activity.activityType
				});
			}
		}
		res.status(200).json(responseJson)
	});
});


// GET: Returns the activity specified by the lncluded activityID
// Authentication: Token. A user must be signed in to access this endpoint
router.get("/id", function(req, res) {

    var responseJson = {
        success: true,
        message: "",
        activities: [],
    };
	
    var activityID = req.query.activityID;
	console.log("In server, specified activityID = " + activityID);
    
    
    if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }
    
   // find the activity with the activityID
	var query = {
		"activityID" : activityID
	};
	
	// assumes that the first one found is the updated activity
	Activity.findOne(query, function(err, activity) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            return res.status(400).send(JSON.stringify(responseJson));
		} else {
			responseJson.success = true;
			responseJson.message = "Activity found with parameter activityID = " + activityID;
			responseJson.activities.push({ 
				loc: activity.loc, // [ long, lat ]
				uv: activity.uvExposure, // same
				speed: activity.speed,  // same
				date: activity.submitTime, // same 
				duration: activity.duration,
				activityType: activity.activityType
			});
		}
		res.status(200).json(responseJson)
	});
});

// PUT: The specified activity (date param) is updated with the specified activity type (activityType body param)
// Authentication is done by token.
router.put("/activity-type/:date", function(req, res) {
	var responseJson = {
        success: true,
        message: ""
    };

	// ensure that the request has the activityType in the body
	if(!req.body.hasOwnProperty("activityType")) {
		responseJson.message = "Missing activityType parameter in body.";
		responseJson.success = false;
		return res.status(400).json(responseJson);
	}

	console.log("req.body.activityType = " + req.body.activityType);
    
	if (authenticateRecentEndpoint) {
        decodedToken = authenticateAuthToken(req);
        if (!decodedToken) {
            responseJson.success = false;
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
        }
    }

	// update the activity's activityType based on date param
	Activity.where({ submitTime: req.params.date})
		.update({ $set: { activityType: req.body.activityType } })
		.setOptions({ multi: false })
		.exec(function(err, status) {
			if(err) {
				responseJson.message = "Activity not found with specified date parameter."
				responseJson.success = false;
				return res.status(400).json(responseJson);
			}
			else {
				responseJson.message = "activityType updated."
				responseJson.success = true;
				return res.status(201).json(responseJson);
			}
		});

});

module.exports = router;
