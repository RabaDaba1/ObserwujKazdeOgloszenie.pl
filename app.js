// PACKAGES
const 	express =            	require('express'),
		app =                   express(),
		flash =					require('connect-flash'),
		dotenv =				require('dotenv').config(),
		expressSanitizer =      require('express-sanitizer'),
		methodOverride =        require('method-override'),
		bodyParser =            require('body-parser'),
		mongoose =              require('mongoose'),
		passport =              require('passport'),
		LocalStrategy =         require('passport-local'),
	  	User = 					require('./models/User'),
		{ startUpdating } =		require('./public/js/scripts');

// ROUTES
const 	userRoutes = require('./routes/user'),
		indexRoutes = require('./routes/index'),
		offerRoutes = require('./routes/offers');
// MONGODB CONNECT
mongoose.connect(`mongodb+srv://Kacper:${process.env.DB_PASSWORD}@cluster0-xljwk.mongodb.net/aplikacjaOLX?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log("ERROR: " + err);
});


// APP SET UP
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(flash());

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	res.locals.warning = req.flash('warning');
	next();
});

// ROUTES
app.use("/", userRoutes);
app.use("/", indexRoutes);
app.use("/offers" , offerRoutes);

app.listen(3000, () => {
	console.log("Server started!");
	// startUpdating();
});