const Offer = require("../../models/Offer");

module.exports = {
	startUpdating: () => setInterval(() => /*Offer.updateAll()*/1, 3600000)
}