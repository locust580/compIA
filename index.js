require('dotenv').config(); 

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');

//const isActiveRoute = require('./server/helpers/routeHelpers');

const app = express();
const port = 5000 || process.env.PORT;

//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'flippy dippy floppy',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),


}))


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

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})