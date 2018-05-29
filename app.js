// Required/(Imported) Dependencies:
//---------------------------------
var ejs = require("ejs");
var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var config = require("./config/database");
var bodyParser = require("body-parser");
var session = require("express-session");
var expressValidator = require("express-validator");

var fileUpload = require("express-fileupload");
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeImg = require("resize-img");
var passport = require("passport");
require("./config/passport")(passport);


//Connection to DB:
//-----------------------
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/cmsConstructionCart";
// mongoose.connect(config.database); >> fr local host // developement server
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function() {
	console.log("We have a green Light for the data storage. We are now connected to MongoDB.")
})


//Initialize App:
// ----------------------
var app = express();

//Engiene Set-Up:
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


//Establish the Static Access to Public Folder:
//------------------------------------------------
app.use(express.static(path.join(__dirname,"public")));


//Set-up Express-FileUpload Middleware:
//------------------------------------------------
//This allows a file to be recieved from the form input.
app.use(fileUpload());


//Set the global variable for the errors in Express-Validator:
app.locals.errors = null;


//Est. Client Page DB Model Access:
//--------------------------------------
var Page = require("./models/page");
var Category = require("./models/category");
var Product = require("./models/product");


//Make all (client-side) PAGES pass into Header.ejs (app.locals.pages):
//---------------------------------------------------------------
Page.find({}).sort({sorting:1}).exec(function (err, pages) {
	if(err) {
		console.log(err);
	}
	else {
		app.locals.pages = pages;
	}
});


//Make all (client-side) CATEGORIES pass into Header.ejs (app.locals.pages):
//---------------------------------------------------------------
Category.find(function (err, categories) {
	if(err) {
		console.log(err);
	}
	else {
		app.locals.categories = categories;
	}
});

//Body Parser Middleware:
//------------------------------------------------
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//Express Session Middleware:
//------------------------------------------------
// Use the session middleware
app.use(session({ 
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true, 
	// cookie: { secure: true }
}));

//Express Validator Middleware:
//-----------------------------------------------
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split("."),
		    root = namespace.shift(),
		    formParam = root;

		while(namespace.length) {
			formParam += "[" + namespace.shift() + "]";
		}		
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	},
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//Express Messages Middleware >> 
//(This Middleware calls the "require" function
//  within its own middleware)
//-----------------------------------------------
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Middleware:
//------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function(req, res, next) {
	res.locals.cart = req.session.cart;
	res.locals.user = req.user || null; //if user is logged in, we have access, otherwise the user === null
	next();
})


//Route Relay:
//------------------------------------------------
var adminProducts = require("./routes/admin_products.js")
app.use("/admin/products", adminProducts);

var adminCategories = require("./routes/admin_categories.js");
app.use("/admin/categories", adminCategories);

var adminPages = require("./routes/admin_pages.js");
app.get("/admin", function(req, res) {
	res.redirect("/admin/pages");
});
app.use("/admin/pages", adminPages);

var products = require("./routes/products.js");
app.use("/products", products);

var users = require("./routes/users.js");
app.use("/users", users);

var cart = require("./routes/cart.js");
app.use("/cart", cart);

var pages = require("./routes/pages.js");
app.use("/", pages);


//Server Set-Up:
//--------------------
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
	console.log("Hey! We're now on the Localhost Server, PORT #" + PORT + ". Happy creating! :D");
});