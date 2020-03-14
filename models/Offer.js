const mongoose = require("mongoose"),
	  cheerio = require("cheerio"),
	  rp =		require("request-promise"),
	  axios = 	require("axios");

const offerParams = ['link', 'title', 'price', 'offerType', 'isNegotiable', 'views', 'description'];

// CONVERT DATES TO READABLE
const convertDate = dateInMs => new Date(dateInMs).toString().split(' ').slice(1, 4).join(' ');

// CHART SUBDOCUMENT
const chartSchema = new mongoose.Schema({
	chartType: {type: String, enum: ["PRICE", "VIEWS"]},
	dates: [Number],
	convertedDates: [String],
	data: [Number]
});

//OFFER SCHEMA
const offerSchema = new mongoose.Schema({
	link: String,
    title: String,
	userTitle: {type: String, default: ''},
	images: [String],
	price: Number,
	offerType: {type: String, enum: ["PURCHASE", "EXCHANGE", "FREE"]},
	isNegotiable: Boolean,
	negotiationTag: String,
	views: Number,
	description: String,
	createdApp: {type: Number, default: Date.now(), get: convertDate},
	createdOlx: String,
	changes: {
		count: {type: Number, default: 0},
		unseen: {type: Number, default: 0},
		changes: [{}],
	},
	charts: {
		price: chartSchema,
		views: chartSchema
	},
	originalOwner: {
		name: String,
		profileLink: String,
		profileImage: String,
		localization: String
	},
	owner: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	}
});

// STATIC SCRAPE
offerSchema.statics.scrape = async(link) => {
	try {
		const response = await axios.get(link);
		const $ = cheerio.load(response.data);

		const title =				$('#offerdescription > div.offer-titlebox > h1').text().trim(),
			  description =			$("#textContent").text().trim(),
			  images =				$(".vtop.bigImage").map((i, el) => $(el).attr('src')).get(),
			  views =				eval($("#offerbottombar > div:nth-child(3) > strong").text()),
			  ownerName =			$('#offeractions > div.offer-sidebar__box > div.offer-user__details > h4 > a').text().trim(),
			  ownerProfileLink =	$('#offeractions > div.offer-sidebar__box > div.offer-user__details > h4 > a').attr('href'),
			  ownerProfileImage = 	$('#offeractions > div.offer-sidebar__box > div.offer-user__location > a > div > img').attr('src'),
			  ownerLocalization =	$('#offeractions > div.offer-sidebar__box > div.offer-user__location > div > address > p').text().trim();

		let price = $("#offeractions > div.price-label > strong").text().trim().replace('zł', '').replace(' ', '').replace(',', '.'),
			offerType = "PURCHASE",
			createdOlx, isNegotiable;

		if(price==='Zamienię') {
			price = 0;
			isNegotiable = false;
			offerType = "EXCHANGE";
		} else if(price === "Zadarmo") {
			price = 0;
			isNegotiable = false;
			offerType = "FREE";
		} else {
			price = parseFloat(price, 10);
			offerType = "PURCHASE";
		}

		const negotiations = $("#offeractions > div.price-label > small").text().trim();
		negotiations ? isNegotiable = true : isNegotiable = false;

		createdOlx = $('#offerdescription > div.offer-titlebox > div.offer-titlebox__details > em').text().trim();

		return {
			link: link,
			title: title,
			images: images,
			price: price,
			offerType: offerType,
			isNegotiable: isNegotiable,
			views: views,
			description: description,
			originalOwner: {
				name: ownerName,
				profileLink: ownerProfileLink,
				profileImage: ownerProfileImage,
				localization: ownerLocalization
			},
			createdOlx
		};
	} catch (err) {
		console.log("==============SCRAPE OFFER ERR==============");
		console.log(err);
	}
	
};

// METHOD UPDATE OFFER
offerSchema.methods.updateOffer = async function() {
	try {
		const updatedOffer = await this.model(this.constructor.modelName).scrape(this.link);

		offerParams.forEach(el => {
			// If change occured
			if(this[el] !== updatedOffer[el]) {
				const currDate = Date.now();
				if(el === 'price') {
					const priceChart = this.charts.price;
					priceChart.data.push(updatedOffer[el]);
					priceChart.dates.push(currDate);
				} else if(el === 'views') {
					const viewsChart = this.charts.views;
					viewsChart.data.push(updatedOffer[el]);
					viewsChart.dates.push(currDate);
				}
				if(el !== 'views' && el !== 'images') {
					this.changes.count++;
					this.changes.unseen++;
					this.changes.changes.push({
						type: el,
						from: this[el],
						to: updatedOffer[el],
						date: currDate
					});
				}
				this[el] = updatedOffer[el];
			}
		});
		await this.save();
	} catch (err) {
		console.log("==============UPDATE OFFER ERR==============");
		console.log(err);
		if(err.name === 'CastError') {
			await this.model(this.constructor.modelName).findByIdAndRemove(this._id);
			console.log("Usunięto nieaktulne ogłoszenie");
		}
	}
};

offerSchema.statics.updateAll = async function() {
	try {
		let offers = await this.model("Offer").find({});
		offers.forEach(async offer => {
			try {
				await offer.updateOffer();
			} catch (err) {
				console.log("==============UPDATE ALL FOREACH ERR==============");
				console.log(err);
			}
		});
	} catch (err){
		console.log("==============UPDATE ALL ERR==============");
	}
};

// TRANSLATE CHANGE TYPE TO PL
offerSchema.methods.translate = function (type) {
	const offerParamsPL = ['Link', 'Tytuł', 'Cena', 'Typ ogłoszenia', 'Do negocjacji', 'Wyświetlenia', 'Opis'];
	
	return offerParamsPL[offerParams.indexOf(type)];
};

// METHOD CONVERT DATES TO READABLE
offerSchema.methods.convertDate = function (dateInMs) { return convertDate(dateInMs)};

offerSchema.methods.convertDates = function() {
	this.charts.views.convertedDates = this.charts.views.dates.map(dateInMs => convertDate(dateInMs));
	this.charts.price.convertedDates = this.charts.price.dates.map(dateInMs => convertDate(dateInMs));
};

module.exports = mongoose.model("Offer", offerSchema);