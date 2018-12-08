var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");  //if a file is called "index.js", then requiring just a
                                            //particular directory automatically requires THAT file,
                                            //so this is same as require("../middleware/index.js").
// INDEX ROUTE -- show all campgrounds
router.get("/", function(request, response){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            response.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

// CREATE ROUTE -- add a new campground
router.post("/", middleware.isLoggedIn, function(request, response){
    // get data from form and add to campgrounds array
    var name = request.body.name;
    var price = request.body.price;
    var image = request.body.image;
    var desc = request.body.description;
    var author = {
        id: request.user._id,
        username: request.user.username
    };
    
    // make an object to push into array:campgrounds
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //  Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreatedCampGround){
        if (err){
            request.flash("error","Something went wrong creating the new campground.");
            console.log(err);
        } else {
            request.flash("success","Campground created!");
            // redirect back to get:campgrounds 
            response.redirect("/campgrounds");
        }
    });
});

// NEW ROUTE -- show form to add campgrounds
router.get("/new", middleware.isLoggedIn, function(request, response){
    response.render("campgrounds/new.ejs");
});

// SHOW ROUTE -- show more details about one campground
router.get("/:id", function(request, response){
    //find the campground with the provided ID (request.params.id contains the DB campground ID)
    Campground.findById(request.params.id).populate("comments").exec(function(err, foundCampground){
       if (err){
           request.flash("error","Something went wrong finding the campground.");
           console.log(err);
       } else {
           //render show template with that campground.  Pass in the found campground.
           response.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

// EDIT ROUTE -- show form to edit a campground
// /campgrounds/:id/edit GET   ---   campgrounds.findById()
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(request,response){
    Campground.findById(request.params.id, function(err,foundCampground){
        response.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE ROUTE -- update a campground record
// /campgrounds/:id/ PUT   ---   campgrounds.findBiIdAndUpdate()
router.put("/:id", middleware.checkCampgroundOwnership, function(request,response){
    Campground.findByIdAndUpdate(request.params.id, request.body.campground, function(err, updatedCampground){
        if(err){
            request.flash("error","Something went wrong updating the Campground.");
            response.redirect("/campgrounds");
        } else {
            response.redirect("/campgrounds/" + updatedCampground._id);
        }
    });
});

// DESTROY ROUTE -- delete campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(request,response){
    Campground.findByIdAndRemove(request.params.id, function(err){
        if(err){
            request.flash("error","Something went wrong while deleting the Campground.");
            console.log(err);
            response.redirect("/campgrounds");
        }
        response.redirect("/campgrounds");
    });
});

module.exports = router;