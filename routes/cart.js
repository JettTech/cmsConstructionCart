// NPM DEPDENCIES
//=========================
var express = require("express");
var router = express.Router();
var fs = require("fs-extra");
// NPM DEPDENCIES
//=========================
var express = require("express");
var router = express.Router();

var Product = require("../models/product");

// ROUTE LOGIC
//=========================
//GET the page that ADDS PRODUCTS to the cart form
router.get("/add/:product", function(req, res) {
	var slug = req.params.product;

	Product.findOne({slug: slug}, function(err, page) {
		if(err) {
			console.log(err);
		}

		if (typeof req.session.cart === "undefined") {
			req.session.cart = [];

			req.session.cart.push ({
				title: slug,
				qty: 1,
				price: parseFloat(product.price).toFixed(2),
				image: "/product_images/" + product._id + "/" + product.image
			});
		}
		else {
			var cart = req.session.cart;
			var newItem = true;

			for (var i=0; i<cart.length; i++) {
				if (cart[i].title === slug) {
					cart[i].qty++;
					newItem = false;
					break;
				}
			}
			if (newItem) {
				cart.push({
					title: slug,
					qty: 1,
					price: parseFloat(product.price).toFixed(2),
					image: "/product_images/" + product._id + "/" + product.image
				});
			}
		}

		console.log(req.session.cart);
		req.flash("success", "Product added!");
		res.redirect("back");

	});
});

//GET the page for the CART Checkout
router.get("/checkout", function(req, res) {
	if(req.session.cart && req.session.cart.length === 0) {
		delete req.session.cart;
		res.redirect("/cart/checkout");
	}
	else {		
		res.render("checkout", {
			title: "Checkout",
			cart: req.session.cart
		});
	}
});

//GET the page for the PRODUCT UPDATE
router.get("/udpate/:product", function(req, res) {
	var slug = req.params.product;
	var cart = req.session.cart;
	var action = req.query.action;

	for (var i = 0; i < cart.length; i++) {
		if(cart[i].title === slug) {
			switch (action) {
				case "add" :
					cart[i].qty++;
					break;
				case "remove" :
					cart[i].qty--;
					if(cart.length < 1) {
						cart.splice(i,1);
					}
					break;
				case "clear" :
					cart.splice(i,1);
					if (cart.length === 0) {
						delete req.session.cart;
					}
					break;
				default:
					console.log("There is a cart updating ERROR. (check out cart.js)...")
					break;
			}
			break;
		}
	}

	console.log(req.session.cart);
	req.flash("success", "Cart updated!");
	res.redirect("/cart/checkout");


	res.render("checkout", {
		title: "Checkout",
		cart: req.session.cart
	});
});

//GET the CLEAR CART page
router.get("/cart/clear", function(req, res) {
	var slug = req.params.product;


});

module.exports = router;