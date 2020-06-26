const Offer = require("../../models/Offer");

module.exports = {
	startUpdating: () => setInterval(() => Offer.updateAll(), 3600000 /*10000*/)
}