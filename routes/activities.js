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

// NOTE: Device must POST data to this endpoint.
// POST: Adds an activity to the database
// Authentication: APIKEY. The device reporting must have a valid APIKEY
router.post("/add", function(req, res) {
    var responseJson = {
        success : false,
        message : "",
    };

    // Ensure the POST data include required properties    
    
    // TODO: Make sure device is sending the right body parameters,
    // deviceId, apikey, longitude, latitude, time, uv, speed
    //
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
        responseJson.message = "Request missing uv parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.message = "Request missing speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
	if( !req.body.hasOwnProperty("duration") ) {
        responseJson.message = "Request missing duration parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
	
	// assign activityType based on the speed parameter
	// change the range above
	var activityTypeString = "";
	if( req.body.speed <= upperWalkingSpeed ) {
		activityTypeString = "walking";
	} else if( req.body.speed > upperWalkingSpeed && req.body.speed <= lowerBikingSpeed ) {
		activityTypeString = "running";
	} else {
		activityTypeString = "biking";
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
               
        // Check to see if an activity was already recoreded within 10 meters (or thereabouts, this needs to be verified)
        /*var findActivityQuery = Activity.findOne({
             'submitTime': { $eq: new Date(myDate.toISOString())}
         });*/

         // Execute the query     
         //findActivityQuery.exec(function (err, activity) {
           /* if (err) {
               console.log(err);
               responseJson.message = "Error accessing db.";
               return res.status(201).send(JSON.stringify(responseJson));
             }*/
             
             // Activity was found, update last reported time
             /*if (activity) {
                 activity.lastReported = Date.now();
                 responseJson.message = "Activity date updated.";
             }*/
             //////////////////////////////////////////////////////////////////////
             // New activity
             /////////////////////////////
             //else {
                 // Create a new activity and save the activity to the database
                 var activity = new Activity({
                     loc: [req.body.longitude, req.body.latitude],
                     uvExposure: req.body.uv,
                     speed: req.body.speed,
                     submitTime: Date.now(),
					 duration: req.body.duration,
					 activityType: activityTypeString
					 // NOTE: default activity type, must be updated
                 });						 // in activityView.html
                 responseJson.message = "New activity recorded.";
            // }                

             // Save the activity data. 
             activity.save(function(err, newActivity) {
                 if (err) {
                     responseJson.status = "ERROR";
                     responseJson.message = "Error saving data in db." + err;
                     return res.status(201).send(JSON.stringify(responseJson));
                 }

                 responseJson.success = true;
                 return res.status(201).send(JSON.stringify(responseJson));
           // });
         });  
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
            for (var activity of recentActivities) {
                // Add activity data to the response's asctivities array
                numRecentActivities++;
                responseJson.activities.push({
                    latitude: activity.loc[1],
                    longitude: activity.loc[0],
                    uv: activity.uvExposure,
                    speed: activity.speed,
                    date: activity.submitTime,
					duration: activity.duration,
					activityType: activity.activityType
                });
            }
            responseJson.message = "In the past " + days + " days, " + numRecentActivities + " UVFit activities have been submitted.";
            return res.status(200).send(JSON.stringify(responseJson));
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
                    latitude: activity.loc[1],
                    longitude: activity.loc[0],
                    uv: activity.uvExposure,
                    speed: activity.speed,
                    date: activity.submitTime,
					duration: activity.duration,
					activityType: activity.activityType

				});
			}
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
