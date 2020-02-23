const express = 			  require("express"),
	  router = 				  express.Router({mergeParams: true}),
	  passport =              require("passport"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  User =				  require("../models/User"),
	  email =				require("../public/js/email/index");

router.get("/", (req, res) => {
    res.render("landing");
});

// REGISTRATION ROUTES
router.get("/login", (req, res) => {
    res.render("authentication/login");
});

router.get("/register", (req, res) => {
    res.render("authentication/register");
});

router.post("/register", async(req, res) => {
    try {
		User.findOne({email: req.body.email}, (err, foundUser) => {
			if(foundUser) {
				req.flash('warning', 'Ktoś już ma taki email :(');
				res.redirect('/register');
			}
		});
		
		if(req.body.password !== req.body.confirmedPassword) {
			req.flash('warning', 'Niepoprawnie potwierdzone hasło');
			res.redirect('/register');
		}
		
		const newUser = await User.register(new User({username: req.body.username, email: req.body.email}), req.body.password);
		
		newUser.verificationToken = User.generateToken();
		newUser.verificationExpires = Date.now() + 3600000;

		await newUser.save();

		await email('verification', newUser.email, newUser.username, newUser.verificationToken);
		
		passport.authenticate("local")(req, res, () => {
			req.flash('success', 'Zarejestrowano pomyślnie!');
			res.redirect("/offers");
		});
    } catch(err) {
		User.findOneAndRemove({email: req.body.email, username: req.body.username}, (err, foundUser) => {
			req.flash('warning', 'Ktoś już się tak nazywa :(');
		})
		console.log(err);
		res.redirect("/register");
    }
});

// LOGIN ROUTES
router.post("/login", passport.authenticate("local", {
    successRedirect: "/offers",
    failureRedirect: "/login"
}), (req, res) => {
    
});

router.get("/logout", (req, res) => {
    req.logout();
	req.flash("success", "Wylogowano pomyślnie");
    res.redirect("/");
});

module.exports = router;