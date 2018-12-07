var db = require("../db");

var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
  passwordHash: String,
  lastAccess:   { type: Date, default: Date.now },
  userDevices:  [ String ],
  activities: [ { date: Date, caloriesBurned: Number, uvExposure: Number, speed: Number  }],
  uvThreshold: { type: Number, default: 6 } // defines threshold for IOT device to warn user
});

var User = db.model("User", userSchema);

module.exports = User;
