var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
   username: String,
   password: String
});

UserSchema.plugin(passportLocalMongoose);  //adds a bunch of methods to UserSchema we need for User Authentication

module.exports = mongoose.model("User", UserSchema);