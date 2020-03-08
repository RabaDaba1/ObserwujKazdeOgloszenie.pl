const 	mongoose = require("mongoose"),
		passportLocalMongoose = require("passport-local-mongoose"),
		crypto = require("crypto");


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
	email: {type: String, unique: true},
	verificationToken: String,
	verificationExpires: Date,
	isVerified: {type: Boolean, default: false },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	subscriptionPlan: {type: String, enum: ['free', 'premium'], default: 'free'},
	messages: [{}]
});

userSchema.statics.generateToken = () => crypto.randomBytes(20).toString("hex");

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);