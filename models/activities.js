var db = require("../db");

// Define the schema
var activities = new db.Schema({
	activityID: { type: Number, default: 1 },
	longitude:  { type: [Number], index: '2dsphere'},
	latitude:   { type: [Number], index: '2dsphere'},
    uvExposure: [Number],
    speed: [Number],
    submitTime: { type: [Date], default: Date.now },
	duration: Number,
	activityType: { type: String, default: "walking" }
		// supported activity types are: walking, running, and biking.
});

// Creates a Devices (plural) collection in the db using the fitData schema
var Activities = db.model("Activities", activities);

module.exports = Activities;

