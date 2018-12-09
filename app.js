var express                 = require("express"),
    seedDB                  = require("./seeds"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    bodyParser              = require("body-parser"),
    User                    = require("./models/user"),
    flash                   = require("connect-flash"),
    LocalStrategy           = require("passport-local"),
    methodOverride          = require("method-override"),
    Comment                 = require("./models/comment"),
    Campground              = require("./models/campground"),
    passportLocalMongoose   = require("passport-local-mongoose");

// Requiring routes defined in separate files.  
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");
    
// configuration and initialization steps
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");  //so you don't have to specify .ejs in filenames


// ==   DB Connection    ==
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
// mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
// mongoose.connect("mongodb://darrell:DbPw#321@ds119273.mlab.com:19273/darrell-yelpcamp", { useNewUrlParser: true });

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));  //_method is what we tell methodOverride to look for.
// console.log(__dirname);  // __dirname shows the directory path to the directory the script (app.js) is in.
app.use(flash());  //flash messages  Put this before app.use(passport...)

// seedDB();  //erase and add in initial campgrounds  

//Passport configuration.
app.use(require("express-session")({
    secret: "Type some secret string here, make it different for each app.  Used to seed encryption",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());  //passport for authentication/authorization
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));   // add User.authenticate method to LocalStrategy
                                                        //  comes from passport-local-mongoose package.
passport.serializeUser(User.serializeUser());       //tells passport to use the methods we got from
passport.deserializeUser(User.deserializeUser());   //passport-local-mongoose and added to User 

// next line is a way to pass certain variables into EVERY route.  It is middleware that will run for 
// every single route.
// >>>>>>>>>>>REMEMBER THIS.<<<<<<<<<<<<<
app.use(function(request,response,next){
    response.locals.currentUser = request.user;  //currentUser is available in every route
    response.locals.error = request.flash("error");     //error ''
    response.locals.success = request.flash("success");  //success ''
    next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

// ========== LISTENER ============
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("YelpCamp server started...");
});