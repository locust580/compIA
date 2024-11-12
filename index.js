require('dotenv').config(); 

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const passport = require('passport');

const app = express();
const port = 5000 || process.env.PORT;

//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

//init session to save things like logins and cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),


}))

//init passport: the google login middleware
app.use(passport.initialize());
app.use(passport.session());

// //patch for a known passport bug (tragic)
// //https://github.com/jaredhanson/passport/issues/907#issuecomment-1697590189
// //TypeError: Cannot read properties of undefined (reading 'regenerate')
// app.use((request, response, next) => {
//   if (request.session && !request.session.regenerate) {
//     request.session.regenerate = (cb) => {
//       cb();
//     };
//   }
//   if (request.session && !request.session.save) {
//     request.session.save = (cb) => {
//       cb();
//     };
//   }
//   next();
// });

//Template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');



//establishes two static asset directories
//src is from google bin tutorial
//public is from express tutorial

app.use(express.static('public'));


//sets up express server on port whatever the port is lol

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})