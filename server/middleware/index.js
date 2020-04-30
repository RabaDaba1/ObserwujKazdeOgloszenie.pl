const Offer = require("../models/Offer");
let middlewareObject = {};

middlewareObject.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
	req.flash('warning', 'Musisz się zalogować');
    res.redirect("/login");
};

middlewareObject.checkOfferOwnership = async(req, res, next) => {
	try {
		if(req.isAuthenticated()) {
			const offer = await Offer.findById(req.params.id).exec();

			if(offer.owner.id.equals(req.user._id)) next();
			else {
				req.flash('error', 'Nie masz to tego dostępu!');
				res.redirect('/offers');
			}

		} else {
			req.flash('error', 'Musisz się zalogować!');
			res.redirect("/login");
		};
	} catch (err) {
		console.log(err);
		req.flash('error', 'Wystąpił błąd :(, spróbuj ponownie');
		res.redirect("/offers");
	}	
};


module.exports = middlewareObject;