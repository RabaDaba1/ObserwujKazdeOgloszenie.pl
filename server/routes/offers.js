const express = require("express"),
	  router = 	express.Router({mergeParams: true}),
	  Offer = require("../models/Offer"),
	  middleware = require("../middleware"),
	  User = require("../models/User");

// INDEX
router.get("/", middleware.isLoggedIn, (req, res) => {
	Offer.find({owner: {id: req.user._id}}, (err, offers) => {
		res.render("offers/index", {offers: offers});
	});
});

// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
	if(req.user.isVerified) res.render("offers/new");
	else {
		req.flash('warning', 'Aby dodawać ogłoszenia musisz potwierdzić swój email!');
		res.redirect("/offers");
	}
});

// CREATE
router.post("/", middleware.isLoggedIn, async (req, res) => {
	if(!req.user.isVerified) {
		req.flash('error', 'Aby dodawać ogłoszenia musisz potwierdzić swój email!');
		res.redirect("offers");
	}
	
	const user = await User.findById(req.user._id);

	if((user.subscriptionPlan === 'free' && user.offerCount >= 3) || (user.subscriptionPlan === 'premium' && user.offerCount >= 50)) {
		let msg;
		user.subscriptionPlan === 'free' ? msg = 'Aby dodawać więcej ogłoszeń musisz wykupić plan premium' : msg = 'Nie możesz dodawać wiecej niż 50 ogłoszeń';

		req.flash('warning', msg);
		res.redirect('/offers');
	}

	const ownerTitle = req.sanitize(req.body.title),
		  link = req.sanitize(req.body.link);
	try {
		const offerData = await Offer.scrape(link);
		const newOffer = await Offer.create(offerData);
		newOffer.owner.id = req.user._id;
		
		if(ownerTitle) newOffer.ownerTitle = ownerTitle;

		// CHARTS
		if (offerData.price !== 0) {
			newOffer.charts.price = {
				chartType: "PRICE",
				dates: [Date.now()],
				data: [newOffer.price]
			};
		} else {
			newOffer.charts.price = undefined;
		}

		newOffer.charts.views = {
			chartType: "VIEWS",
			dates: [Date.now()],
			data: [newOffer.views]
		};

		await newOffer.save();
		
		user.offerCount++;
		await user.save();

		req.flash('success', 'Pomyślnie dodano ogłoszenie');
		res.redirect("/offers");
	} catch(err) {
		console.log(err);
		if(err.name === 'ValidationError') {
			req.flash('error', 'Wystąpił błąd przy dodawaniu ogłoszenia :(. Upewnij się że twoje ogłoszenie istnieje a link zaczyna się od "https://www.olx.pl/"');
			res.redirect("/offers");
		}
	}
});

// SHOW
router.get("/:id", middleware.checkOfferOwnership, async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.id).exec();
		offer.changes.unseen = 0;
		await offer.save();
		
		res.render("offers/show", {offer: offer, priceChart: offer.charts.price, viewsChart: offer.charts.views});
	} catch (err) {
		req.flash('error', 'Wystąpił błąd podczas ładowania ogłoszenia :(, spróbuj ponownie');
		res.redirect("/offers");
	}
});

// DELETE
router.delete("/:id", middleware.checkOfferOwnership, async (req, res) => {
	try {
		await Offer.findByIdAndRemove(req.params.id).exec();

		const user = await User.findById(req.user._id).exec();
		user.offerCount--;
		await user.save();

		req.flash('success', 'Pomyślnie usunięto ogłoszenie');
		res.redirect("/offers");	
	} catch (err) {
		req.flash('error', 'Wystąpił błąd podczas usuwania ogłoszenia :(, spróbuj ponownie');
		res.redirect("/offers");
	}
});

//TESTING
router.get("/:id/update", middleware.checkOfferOwnership, async (req, res) => {
	try {
		let offer = await Offer.findById(req.params.id).exec();
		await offer.updateOffer();
		
		req.flash('success', 'Pomyślnie zaktualizowano ogłoszenie');
		res.redirect(`/offers/${offer._id}`);
	} catch (err) {
		req.flash('error', 'Wystąpił błąd podczas aktualizacji ogłoszenia :(, spróbuj ponownie')
		res.redirect("/offers");
	}
}); 

module.exports = router;