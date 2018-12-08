var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

// landing page route
router.get("/", function(request, response){
   response.render("landing");
});

// =  AUTHENTICATION ROUTES  =

// Show register form
router.get("/register", function(request,response){
    response.render("register");
});

// Handle registration logic
router.post("/register", function(request,response){
    //User.register() function is provided by passport-local-mongoose addin.
    var newUser = new User({username: request.body.username});
    User.register(newUser, request.body.password, function(err,user){
        if(err){
            request.flash("error", err.message);  //err object, here, describes why the registration failed.
            return response.redirect("/register");
        }
        // next line runs User.serializeUser().  
        // This is where actual login happens
        // here instead of "local" you could specify facebook or twitter or google or...
        passport.authenticate("local")(request,response,function(){  
            request.flash("success","Success!  Welcome to YelpCamp "+user.username);
            response.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", function(request,response){
    response.render("login");
});

// Submit login form and process login
//  passport.authenticate is "middleware" which means it runs in the middle, before the final route callback.
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(request,response){
});

// Logout route
router.get("/logout",function(request,response){
    request.logout();
    request.flash("success","You have been logged out.");
    response.redirect("/campgrounds");
});


module.exports = router;