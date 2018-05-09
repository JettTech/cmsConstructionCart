// NPM DEPDENCIES
//=========================
var express = require("express");
var router = express.Router();

// ROUTE LOGIC
//=========================
router.get("/", function(req, res) {
	res.redirect("/pages");
})

router.get("/pages", function(req, res) {
	res.render("index", {
		title: "CMS Construction.Co"
	})//;
});

router.get("/pages/test", function(req, res) {
	res.send("This is the testing area...");
});

module.exports = router;