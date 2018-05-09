// NPM DEPDENCY IMPORTS:
//=========================
var express = require("express");
var router = express.Router();
var mkdirp = require("mkdirp");
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// var auth = require('../config/auth');
// var isAdmin = auth.isAdmin;

//===========================================================================
// ACCESS TO DB AND its MODEL:
//============================================================================
//Access to the Product Model
var Product = require("../models/product");
var Category = require("../models/category");


//============================================================
// ==============  GET ROUTE LOGIC  ============= 
//============================================================
//1.) To Get Admin Product Index:
//------------------------
//This route is refering to the "/admin/products/" ..as this part is the root file listed in the app.js file.
router.get("/", function(req, res) {
	var count;

	Product.count(function(req, countResult) {
		count = countResult;
	});

	// res.send("This is the Admin Product Area");
	Product.find(function(err, products) {
		res.render("admin/products", {
			title: "Product Dashboard",
			products: products,
			count: count
		});
	});
});

//2.) To Get Admin Products Test:
//------------------------
//This route is refering to the "/admin/products/test" ..as this part is the root file listed in the app.js file.
router.get("/test", function(req, res) {
	res.send("This is the testing area...");
});


//3.) To Get Admin Product >> Add Product:
//--------------------------------
//This route is refering to the "/admin/products/add-product" ..as this part is the root file listed in the app.js file.
router.get("/add-product", function(req, res) {
	var title = "";
	var description = "";
	var price = "";

	Category.find(function (err, categories) {
		res.render("admin/add_product", {
			title: title.replace(/\-+/g, " "),
			description: description,
			categories: categories,
			price: price
		});
	});
});

//4.) To Get Edit-Product Products >> Edit a product-for Admin Views:
//--------------------------------
//This route is refering to the "/admin/products/add-product" ..as this part is the root file listed in the app.js file.
router.get("/edit-product/:id", function(req, res) {
	var errors;
	var title = "";
	var description = "";
	var price = "";
	var image = "";

	if (req.session.errors) {
		errors = req.session.errors;
		req.session.errors = null;
	}

	Category.find(function (err, categories) {

		Product.findById(req.params.id, function(err, product) {
			if(err) {
				return console.log(err);
			}
			else {
				var galleryDir = "public/product_images/" + p._id + "/gallery";
				var galleryImages = mull;

				fs.readdir(galleryDir, function(err,  files) {
					if (err) {
						console.log(err)
					}
					else {
						galleryImages = files;

						res.render("admin/edit_product", {
							errors: errors,
							id: product._id,
							title: product.title.replace(/\-+/g, " "),
							description: product.description,
							categories: categories,
							category: product.category.replace(/\s+/g, "-").toLowerCase(),
							price: parseFloat(product.price).toFixed(2),
							image: product.image,
							galleryImages: galleryImages
						});
					}
				})	
			}		
		});
	});
});


//5.) To Get View-Product Products >> View a product-for Admin Views:
//--------------------------------
//This route is refering to the "/admin/products/add-product" ..as this part is the root file listed in the app.js file.
router.get("/view-product/:id", function(req, res) {
	Product.findById(req.params.id, function(err, product) {
		if(err) {
			return console.log(err);
		}
		var title = "";
		var description = "";
		var price = "";
		var image = "";

		Category.find(function (err, category) {
			res.render("admin/view-product", {
				id: product._id,
				title: product.title.replace(/\-+/g, " "),
				description: product.description,
				category: product.category,
				price: product.price,
				image: product.image
			});
		});
	});
});


//6.) To Get Delete-Product Products >> Delete a Product:
//-------------------------------------------------
//This route is refering to the "/admin/products/delete-product" ..as this part is the root file listed in the app.js file.
router.get("/delete-product/:id", function(req, res) {
	//FYI: WE NEVER REDIRECT from the current (default) "/admin/products product, as we are only updating
	//the dateabase with the exisitance of a document or not (and thus how maany/what docs ot display
	//on the current product or not)...

	Product.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			return console.log(err);
		}
		req.flash("success", "The product was successfully deleted.");
		res.redirect("/admin/products");

	});
});


//============================================================
// ==============  POST ROUTE LOGIC  ============= 
//============================================================
//1.) To POST newly created Admin products to DB:
//-----------------------------------------------
//This route is refering to the "/admin/products/add-product" ..as this part is the root file listed in the app.js file.
router.post("/add-product", function(req, res) {
	// all the files uploaded are inside the "req.file" because each of the files are uploaded in a ".file" package with the "express-fileupload" dependancy.
	var imageFile = typeof req.files.image !== undefined ? req.files.image.name : "";

	//validate with the express-validator dependency:
	req.checkBody("title", "Title must have a value.").notEmpty();
	req.checkBody("description", "Description must have a value.").notEmpty();
	req.checkBody("price", "Price must have a numeric value.").notEmpty().isDecimal();
	req.checkBody("image", "Image must have a value.").isImage(imageFile);

	//using body-parser depencdy to parse and determine the "body" variable here:
	var title = req.body.title.trim().replace(/\s+/g, "-").toLowerCase();
	var slug = title.trim().replace(/\s+/g, "-").toLowerCase();
	var description = req.body.description.trim();
	var price = req.body.price;
	var category = req.body.category;
	var image = imageFile;


	console.log("\n");
	console.log("this is your Product title:");
	console.log(title);
	console.log("this is your Product description:");
	console.log(description);
	console.log("this is your Product price:");
	console.log(price);
	console.log("\n");

	var errors = req.validationErrors();
	if (errors) {
		console.log("You have an error");
		console.log(errors);

		Category.find(function (err, categories) {
			res.render("admin/add_product", {
				errors: errors,
				title: title,
				description: description,
				price: price,
				categories: categories
			});
		});
	}
	else if (category === "Please Select a Category Below") {
		req.flash ("danger", "You must choose a Category.");
		Category.find(function (err, categories) {
			res.render("admin/add_product", {
				title: title,
				description: description,
				categories: categories,
				price: price,
				image: image
			});
		});
	}
	else {
		console.log("You have submitted your values for the DB.... !!");
		//Format: Product.findOne({"CollectionName":"File Var", ie.Slug})
		Product.findOne({title:title}, function (err, product) {
			if (product) {
				//"flash" refers to the express-messages:
				req.flash ("danger", "This Product Title already exists. Please choose another.");
				Category.find(function (err, categories) {
					res.render("admin/add_product", {
						title: title,
						description: description,
						categories: categories,
						price: price,
						image: image
					});
				});
			}
			else {
				var priceFixed = parseFloat(price).toFixed(2);

				var product = new Product({
					title: title,
					slug: slug,
					description: description,
					price: priceFixed,
					category: category,
					image: image
				});

				product.save(function(err) {
					if (err) {
						return console.log(err);
					}
					else {
						//as soon as "DbModule.save" (above occurs), the mongoose _id is available, se it is possible to create the below url.
						mkdirp("public/product_images/" + product._id, function(err) {
							return console.log("this is your error1 : " + err);
						});

						mkdirp("public/product_images/" + product._id + "/gallery", function(err) {
							return console.log("this is your error2 : " + err);
						});

						mkdirp("public/product_images/" + product._id + "/gallery/thumbnails", function(err) {
							if(err) { 
								return console.log("this is your error3 : " + err);
							}
							else {
								if (image !== "") { //say "imageFile" instead?
									var productImage = req.files.image;
									var path = "public/product_images/" + product._id + "/" + image; // use "imageFile" instead?

									console.log("this is the path");
									console.log(path);

									productImage.mv(path, function(err) {	
										return console.log("Error after the productImage.mv() func., error3 : " + err);
									})
								}
							}
						});
					}
					req.flash("success", "Product added!");
					res.redirect("/admin/products");
				});
			}
		});
	}

});

//2.) To POST the Re-Ordered Product list (while on the admin/products site) in the DB:
//-------------------------------------------------------------------------------
//This route is refering to the "/admin/products/reorder-products" ..as this part is the root file listed in the app.js file.
router.post("/reorder-products", function(req, res) {
	var ids = req.body["id[]"];
	var count = 0;

	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		count++;
		//implement closure to ensure that all product reordering is completed (as node === asynchronous)
		(function(count) { //opening closure
			Product.findById(id, function(err, product) {
				product.sorting = count;
				product.save(function(err) {
					if(err) return console.log(err);
				});
			});
		})(count); //ending for closure
	}
});

//4.) To POST the UPDATE the Edited products to DB:
//-----------------------------------------------
//This route is refering to the "/admin/products/edit-product/:slug" ..as this part is the root file listed in the app.js file.
router.post("/edit-product/:id", function(req, res) {
	// all the files uploaded are inside the "req.file" because each of the files are uploaded in a ".file" package with the "express-fileupload" dependancy.
	var imageFile = typeof req.files.image !== undefined ? req.files.image.name : "";

	//validate with the express-validator dependency:
	req.checkBody("title", "Title must have a value.").notEmpty();
	req.checkBody("description", "Description must have a value.").notEmpty();
	req.checkBody("price", "Price must have a value.").notEmpty().isDecimal();
	req.checkBody("image", "Image must have a value.").isImage(imageFile);

	//using body-parser depencdy to parse and determine the "body" variable here:
	var id = req.params.id;
	var title = req.body.title.trim().replace(/\s+/g, "-").toLowerCase();
	var slug = title.trim().replace(/\s+/g, "-").toLowerCase();
	var description = req.body.description.trim();
	var price = req.body.price;
	var category = req.body.category;
	var pImage = req.body.pImage;


	console.log("\n");
	console.log("this is your Product title:");
	console.log(title);
	console.log("this is your Product description:");
	console.log(description);
	console.log("this is your Product price:");
	console.log(price);
	console.log("\n");

	var errors = req.validationErrors();
	if (errors) {
		console.log("You have an error");
		console.log(errors);

		req.session.errors = errors;
		Category.find(function (err, categories) {
			res.render("admin/add_product", {
				errors: errors,
				title: title,
				description: description,
				price: price,
				categories: categories
			});
		});
	}
	else if (category === "Please Select a Category Below") {
		req.flash ("danger", "You must choose a Category.");
		Category.find(function (err, categories) {
			res.render("admin/add_product", {
				title: title,
				description: description,
				categories: categories,
				price: price,
				image: image
			});
		});
	}
	else {
		console.log("You have submitted your values for the DB.... !!");
		//Format: Product.findOne({"CollectionName":"File Var", ie.Slug})
		Product.findOne({title:title, _id:{"$ne":id}}, function (err, product) {
			if (err) {
				console.log(err);
			}
			else if (product) {
				//"flash" refers to the express-messages:
				req.flash ("danger", "This Product Title already exists. Please choose another.");
				Category.find(function (err, categories) {
					res.render("admin/add_product", {
						title: title,
						description: description,
						categories: categories,
						price: price,
						image: image
					});
				});
			}
			else {
				var priceFixed = parseFloat(price).toFixed(2);

				Product.findById(id, function(err, category) {
					if (err) {
						return console.log();
					}

					prod...

					product.save(function(err) {
						if (err) {
							return console.log(err);
						}

						if(imageFile !-- "") {
							if(pImage !== "") {
								fs.remove("public/product_images/" + id)
							}
						}
						//as soon as save (above occurs), the mongoose _id is available, se it is possible to create the below url.
						mkdirp("public/product_images/" + product._id, function(err) {
							return console.log(err);
						});

						mkdirp("public/product_images/" + product._id + "/gallery", function(err) {
							return console.log(err);
						});

						mkdirp("public/product_images/" + product._id + "/gallery/thumbnails", function(err) {
							return console.log(err);
						});

						if (image !== "") { //say "imageFile" instead?
							var productImage = req.files.image;
							var path = "public/product_image/" + product._id + "/gallery/thumbnails/"; // + image; // use "imageFile" instead?

							productImage.mv(path, function(err) {	
								return console.log(err);
							})
						}					

						req.flash("success", "Product added!");
						res.redirect("/admin/products");
					});
				});
			}
		});
	}
});


module.exports = router;