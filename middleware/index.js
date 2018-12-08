var Campground = require("../models/campground");
var Comment = require("../models/comment");

//  ALL THE MIDDLEWARE FOR THE WHOLE APP GOES HERE
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(request,response,next){
    if(request.isAuthenticated()){
        //yes: continue...
        Campground.findById(request.params.id, function(err,foundCampground){
            if (err){
                console.log(err);
                request.flash("error","Something went wrong finding the Campground.");
                response.redirect("back");
            } else {
                // Handle the case of someone editing the id in the url so that no campground is found but no error thrown.
                if (!foundCampground){
                    request.flash("error", "Campground not found.");
                    return response.redirect("back")
                }

                // Does the user own the campground?
                // console.log(foundCampground.author.id === request.user._id);  //false!
                // console.log(typeof foundCampground.author.id); //object
                // console.log(typeof request.user._id); //object
                // console.log(typeof request.user.id); //string
                //can't use == or === comparison operator, but mongoose provides a method:
                // console.log(foundCampground.author.id.toString()===request.user.id);  //true!
                // could also just cast the objects to strings and then compare.
                if (foundCampground.author.id.equals(request.user._id)){
                    next();
                } else {
                    request.flash("error","You don't have permission to do that.");
                    response.redirect("back");
                }
            }
        });
    } else {
        request.flash("error","You must be logged in to do that.");
        response.redirect("back");  //sends user back to page they came from.
    }
};

middlewareObj.checkCommentOwnership = function(request,response,next){
    if(request.isAuthenticated()){
        //yes: continue...
        Comment.findById(request.params.comment_id, function(err,foundComment){
            if (err){
                request.flash("error","Something went wrong.");
                response.redirect("back");
            } else {
                if(!foundComment){
                    request.flash("error","Comment not found.");
                    response.redirect("back");
                }
                if (foundComment.author.id.equals(request.user._id)){
                    next();
                } else {
                    request.flash("error","You don't have permission to do that.");
                    response.redirect("back");
                }
            }
        });
    } else {
        request.flash("error","You must be logged in to do that.");
        response.redirect("back");  //sends user back to page they came from.
    }
};

middlewareObj.isLoggedIn = function(request, response, next){
    if(request.isAuthenticated()){
        return next();  //next() means do whatever function comes next after the middleware.
    };
    request.flash("error","You must be logged in to do that.");
    response.redirect("/login");
};

module.exports = middlewareObj;