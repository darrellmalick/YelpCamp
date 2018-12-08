var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");  //if a file is called "index.js", then requiring just a
                                            //particular directory automatically requires THAT file,
                                            //so this is same as ... require("../middleware/index.js").

// New Comment route - show new comment form
router.get("/new", middleware.isLoggedIn, function(request,response){
    // find campground by ID and send it along to render
    Campground.findById(request.params.id,function(err,foundCampground){
        if(err){
            request.flash("error","Something went wrong.");
            console.log(err);
        } else {
            response.render("comments/new", {campground: foundCampground});  
        }
    });
});

// Create Comment route - create new comment then redirect
router.post("/", middleware.isLoggedIn, function(request,response){
   // lookup campground using ID
   Campground.findById(request.params.id, function(err, foundCampground){
      if (err) {
          console.log(err);
          response.redirect("/campgrounds");
      } else {
        // create new comments
        Comment.create(request.body.comment, function(err, newComment){
            if(err){
                request.flash("error","Something went wrong while adding your comment.");
                console.log(err);
                response.redirect("/campgrounds");
            } else {
                //add username and id to comment
                newComment.author.id = request.user._id;
                newComment.author.username = request.user.username;
                //save comment
                newComment.save();
                //push comment into campground
                foundCampground.comments.push(newComment);
                foundCampground.save();
                request.flash("success","Your comment has been added!");
                response.redirect("/campgrounds/"+ foundCampground._id);
            }
        });
      }
   });
});

// full route is /campgrounds/:id/comments/:comment_id/edit.  Need to make the 
// :id parameter different than the campground id so you can pull it out of 
// body.params.id  vs body.params.comment_id

// COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(request,response){
    Comment.findById(request.params.comment_id, function(err,foundComment){
        if(err){
            response.redirect("back");
        } else {
            response.render("comments/edit",{campgroundId: request.params.id, comment: foundComment});
        }
    });
});

// COMMENTS UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(request,response){
    Comment.findByIdAndUpdate(request.params.comment_id, request.body.comment, function(err,updateComment){
       if(err){
           request.flash("error","Something went wrong.");
           response.redirect("back");
       } else {
           response.redirect("/campgrounds/" + request.params.id);
       }
    });
});

// COMMENTS DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(request,response){
    Comment.findByIdAndRemove(request.params.comment_id, function(err){
        if(err){
            request.flash("error","Something went wrong while deleting comment.");
            console.log(err);
            response.redirect("back");
        }
        request.flash("success","Successfully deleted comment.");
        response.redirect("/campgrounds/"+request.params.id);
    });
});


module.exports = router;