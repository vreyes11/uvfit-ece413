var db = require("../db");


// Define the schema
var activities = new db.Schema({
	activityID: { type: Number, default: 1 },
	loc:           { type: [Number], index: '2dsphere'},
	//longitude:  { type: [Number], default: 0 },
	//latitude:   { type: [Number], default: 0 },
    uvExposure: { type: [Number], default: 0 },
    speed: { type: [Number], default: 0 },
    submitTime: { type: [Date], default: Date.now },
	duration: { type: Number, default: 0 },
	activityType: { type: String, default: "walking" }
		// supported activity types are: walking, running, and biking.
});

// Creates an Activities (plural) collection in the db using the activities schema
var Activities = db.model("Activities", activities);

module.exports = Activities;

