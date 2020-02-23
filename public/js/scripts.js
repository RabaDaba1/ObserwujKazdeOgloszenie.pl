const Offer = require("../../models/Offer");

module.exports = {
	startUpdating: () => setInterval(() => Offer.updateAll(), 1800000 /*60000*/)
}