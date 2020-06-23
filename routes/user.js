const express = 			  	require("express"),
	  router = 				  	express.Router({mergeParams: true}),
	  passport =              	require("passport"),
	  passportLocalMongoose = 	require("passport-local-mongoose"),
	  User =				  	require("../models/User"),
	  Offer = 					require('../models/Offer'),
	  email =					require("../scripts/email/index"),
	  middleware = 				require("../middleware");

router.get('/mypage', middleware.isLoggedIn, async(req, res) => {
	try {
		const userOffers = await Offer.find({ owner: { id: req.user._id } }).exec();

		let lastWeekChangeCount = 0;
		let unseenChanges = 0;
		let latestChange = 0;
		userOffers.forEach(offer => {
			if(offer.changes.count > 0) {
				offer.changes.changes.forEach(change => {
					if(Date.now() - change.date < 604800000) lastWeekChangeCount++;
					if(change.date > latestChange) latestChange = change.date;
				});
				unseenChanges += offer.changes.unseen;
			}
		});

		res.render('mypage', { lastWeekChangeCount, unseenChanges, latestChange });
	} catch(err) {
		console.log(err);
	}
});

// AUTHENTICATION ROUTES
router.get("/auth", (req, res) => {
	res.render('authentication/auth');
});

router.post("/auth", async(req, res) => {
	const user = await User.findOne({ email: req.body.email });
	
	if(user.isVerified) {
		req.flash('success', 'Twoje konto jest już zweryfikowane');
		res.redirect('/');
	} else if(!user.isVerified) {
		user.verificationToken = User.generateToken();
		user.verificationExpires = Date.now() + 3600000;
	
		await user.save();
	
		await email('verification', user.email, user.username, user.verificationToken);
	
		req.flash('success', 'Email został wysłany, sprawdź skrzynkę i spam');
		res.redirect('/')
	} else {
		req.flash('warning', 'Użytkownik z takim adresem email nie istnieje');
		res.redirect('/auth');
	}
});

router.get("/auth/:token", async(req, res) => {
	try {
		const token = req.params.token;

		let user = await User.findOne({ verificationToken: token, isVerified: false, verificationExpires: { $gt: Date.now() }}).exec();
		
		if(user) {
			if(user.verificationToken === token) user.isVerified = true;
			user.verificationToken = undefined;
			user.verificationExpires = undefined;
			
			req.flash('success', 'Konto zweryfikowano pomyślnie, teraz masz dostęp do wszstkich funkcji');

			user.save(err => req.logIn(user, () => res.redirect("/offers")));
		} else {
			req.flash('warning', 'Upewnij się czy już wcześniej nie zweryfikowałeś/aś swojego konta. Aby to zrobić zaloguj się i przejdź do zakładki "Moje konto", jeżeli twoje konto wciąż nie jest zweryfikowane, spróbuj ponownie (link wygasa po godzinie)');
			res.redirect("/");
		}
		
	} catch(err) {
		req.flash('error', 'Wystąpił błąd podczas weryfikacji, spróbuj ponownie');
		res.redirect("/");
	}
});


// RESET PASSWORD ROUTES
router.get('/forgot', (req, res) => {
	res.render('authentication/forgot');
});

router.post('/forgot', async(req, res) => {
	let user = await User.findOne({email: req.body.email}).exec();
	
	if(user) {
		user.resetPasswordToken = User.generateToken();
		user.resetPasswordExpires = Date.now() + 3600000;
		await user.save();
		
		await email('resetPassword', user.email, user.username, user.resetPasswordToken);
		req.flash('success', 'Email został wysłany, sprawdź skrzynkę i spam');
		res.redirect('/');
	} else {
		req.flash('warning', 'Nie ma użtkownika z takim emailem, spróbuj ponownie');
		res.redirect('/forgot');
	}
});

router.get('/reset/:token', async(req, res) => {
	const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}).exec();
	
	if(user) {
		res.render('authentication/reset', {token: req.params.token});
	} else {
		req.flash('error', 'Link jest nieprawidłowy lub wygasła jego data ważności (po godzinie link jest nieważny), spróbuj ponownie');
		res.redirect('/forgot');
	}
});

router.post('/reset/:token', async (req, res) => {
	let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}).exec();
	
	if(user) {
		if(req.body.password !== req.body.confirmedPassword) {
			req.flash('warning', 'Niepoprawnie potwierdzone hasło');
			res.redirect('back');
		}
		
		user.setPassword(req.body.password, err => {
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			user.save(err => req.logIn(user, () => {
				req.flash('success', 'Hasło zostało zmienione');
				res.redirect('/offers');
			}));
		});
	} else {
		req.flash('error', 'Link jest nieprawidłowy lub wygasła jego data ważności (po godzinie link jest nieważny), spróbuj ponownie');
		res.redirect('back');
	}
});

module.exports = router;