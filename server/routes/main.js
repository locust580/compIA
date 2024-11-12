const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const searchFor = require('../helpers/search');
require('dotenv').config();

require('../../auth');

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}

//google stuff 
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const passport = require('passport');
const calendar = google.calendar('v3');


// Get 
// Home Page

router.get('', async (req, res) => {
  try {
      const locals = {
          title: "WA Club Website",
          description: "See all the clubs here!"
      }

      let perPage = 10;
      let page = req.query.page || 1;

      const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

      const count = await Post.countDocuments({});
      const nextPage = parseInt(page) + 1;
      const hasNextPage = nextPage <= Math.ceil(count / perPage);

      res.render('index', { 
          locals, 
          data,
          current: page,
          nextPage: hasNextPage ? nextPage : null,
      });

  } catch (error) {
      console.log(error);
  }

})

// Post
// Search Function

router.post('/search', async (req, res) => {
    try {
  
      const locals = {
          title: "Search",
          description: "Search"
        }
      
      let searchTerm = req.body.searchTerm;
      let data = await searchFor(searchTerm);
      
      res.render("search", {
          data,
          locals
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

//About Page

router.get('/about', (req, res) => {

    const locals = {
        title: "About",
        description: "About WALF",
    }

    res.render('about', { locals });
})


//Calendar

router.get('/calendar', (req, res) => {

  const locals = {
      title: "Calendar",
      description: "Its a calendar",
  }

  res.render('calendar', { locals });
})

router.post('/create-event', async (req, res) => {
  try {
    const event = {
      "title": req.body.title,
      "location": "Unknown",
      "description": req.body.body,
      "start": {
        "dateTime": "2024-10-29T15:15:00-06:00",
        "timeZone": "America/Dallas"
      },
      "end" : {
        "dateTime": "2024-10-29T16:15:00-06:00",
        "timeZone": "America/Dallas"
      },
      'recurrence': [
        'RRULE:FREQ=WEEKLY'
      ],
      'attendees': [
        {'email': 'wa.clubsite@gmail.com'},
        {'email': 'hunterbearintx@gmail.com'},
      ],
    }

    calendar.events.insert({
      auth: auth,
      calendarID: 'primary',
      resource: event,
    }, function(err, event) {
      if(err) {
        console.log('error lol' + err);
        return;
      }
      console.log('Event created: %s', event.htmlLink);
    });

    res.redirect('/calendar')

  } catch (error) {
    console.log(error)
    return null
  }
})

//protected club view page

router.get('/protected', isLoggedIn, (req, res) => {
  const data = {
    stuff: req.user.displayName,
  }
  
  res.render('protected')
})

//next four are self-explaining; have to do with google sign in routes
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['email', 'profile']})
);

router.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/failure'
  })
)

router.get('/failure', (req, res) => {
  res.render('failure')
})

//Tragically the logout function is broken at this moment;
//passport seems to have some issues with cookies

// router.get('/logout', isLoggedIn, (req, res) => {
//   req.logout((err) => {
//     console.log(err);
//   });
//   req.session.destroy();
//   res.redirect('calendar')
// })


//Individual Club Post Page

router.get('/post/:id', async (req, res) => {
  try {
      
      let slug = req.params.id;

      const data = await Post.findById({ 
          _id: slug,
      });

      

      const locals = {
          title: data.title,
          description: "Lost and Found",
      }

      res.render('post', { locals, data });

  }   catch (error) {
      console.log(error);
  }

});



module.exports = router;