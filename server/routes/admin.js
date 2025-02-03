const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const multer = require('multer');
const { error } = require('console');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/image-uploads/")
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})


const upload = multer({
  storage: storage
  },
)

//google calendar stuff
const {google} = require('googleapis');
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar('v3');

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

/**
 * Check Login
 */

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if(!token) {
    return res.render('admin');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    return res.render('admin');
  }

}


//gets a google calendar event's ID and returns it

const getEventID = async (dateTimeStart, dateTimeEnd) => {

  try {
      let response = await calendar.events.list({
          auth: auth,
          calendarId: calendarId,
          timeMin: dateTimeStart,
          timeMax: dateTimeEnd,
          // timeZone: 'America/Chicago'
      });
  
      let id = response['data']['items'][0].id;
      return id;
  } catch (error) {
      console.log(`Error at getEventID --> ${error}`);
      return 0;
  }
};


/**
 * Get /
 * Admin - Login Page
 */

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }

});

/**
 * POST /
 * Admin - Check Login
 */

router.post('/admin', async (req, res) => {
  try {

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if(!user) {
      return res.render('admin');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.render('admin');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }

});


/**
 * Get /
 * Admin Dashboard
 */

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Admin Dashboard",
      description: "Admin only portion of the site"
    }


    const data = await Post.find();
    res.render('admin/dashboard', { 
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});


/**
 * Get /
 * Page for making new posts
 */

router.get('/add-post', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Add Post",
      description: "Admin only portion of the site"
    }


    const data = await Post.find();
    res.render('admin/add-post', { 
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});

/**
 * Post /
 * Create New Post
 */

const insertEvent = async (event) => {

  try {
      await calendar.events.insert({
          auth: auth,
          calendarId: calendarId,
          resource: event
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        } 
      });
      console.log(event.htmlLink);
  } catch (error) {
      console.log(`Error at insertEvent --> ${error}`);
      return 0;
  }
};

router.post('/add-post', authMiddleware, upload.single('imgfile'), async (req, res) => {
  try {

    let start = req.body.startDay + 'T' + req.body.startHour + ':00-06:00'
    let end = req.body.startDay + 'T' + req.body.endHour + ':00-06:00'

    let freq = ""
    switch (req.body.recurrence) {
      case "W":
        freq = "RRULE:FREQ=WEEKLY;UNTIL=20250530T120000Z";
        break
      case "B":
        freq = "RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=20250531T120000Z";
        break
      case "M":
        freq = "RRULE:FREQ=MONTHLY;UNTIL=20250531T120000Z";
        break
      case "D":
        freq = "RRULE:FREQ=DAILY;UNTIL=20250531T120000Z";
        break
      default:
        freq = null;
    }

    var event = {
      'summary': req.body.title,
      'location': '2600 J T Ottinger Rd, Westlake, TX 76262',
      'description': req.body.body,
      'start': {
        'dateTime': start,
        'timeZone': 'America/Chicago',
      },
      'end': {
        'dateTime': end,
        'timeZone': 'America/Chicago',
      },
      'recurrence': [freq],
      'reminders': {
        'useDefault': true,
      },
    };

    insertEvent(event)
      .then((res) => {
        console.log("inner success:" + event.htmlLink);
      })
      .catch((err) => {
        console.log("inner failure:" + err);
      });
    
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      imagePath: req.file.filename,
      createdAt: Date.now(),
      startDay: start,
      endTime: end,
      recurrence: freq,
      eventID: await getEventID(start,end),
    })

    await Post.create(newPost);

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error)
  }
});

/**
 * Get /
 * Edit/Delete Posts Page
 */

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Admin only portion of the site"
    }

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      data,
      locals,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }
});

/**
 * Put /
 * Edit Posts
 */

router.put('/edit-post/:id', authMiddleware, upload.single('imgfile'), async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { 
      title: req.body.title,
      body: req.body.body,
      imagePath: req.file.filename,
      updatedAt: Date.now(),
      startDay: req.body.startDay,
      endTime: req.body.endHour,
      recurrence: req.body.recurrence,
      eventID: await getEventID(req.body.startDay, req.body.endHour)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
    }).then(async (Post) => {
      console.log(Post)
      await fs.unlink("public/image-uploads/" + Post.imagePath, (err) => {
        if (err) console.log(err);
      })
    })
    

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE /
 * Delete Posts
 */

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {

    postData = await Post.findById(req.params.id);

    console.log(postData);

    try {
      fs.unlink("public/image-uploads/" + postData.imagePath, (err) => {
        if (err) throw err;
        console.log(`${postData.imagePath} was deleted`);
      });
    } catch (err) {
      console.log(err);
    }

    try {
      calendar.events.delete({
        auth: auth,
        calendarId: calendarId,
        eventId: postData.eventID,
        sendUpdates: all
        
    }
    // , function(err, event) {
    //   if (err) {
    //     console.log('There was an error contacting the Calendar service: ' + err);
    //     return;
    //   } 
    // }
  );
    } catch (error) {
      console.log(error)
    }

    await Post.deleteOne( { _id: req.params.id } );

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin Logout
 */

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/')
})

module.exports = router;



// router.post('/admin', async (req, res) => {
//   try {

//     const { username, password } = req.body;
//     console.log(req.body);

//     res.redirect('/admin');
//   } catch (error) {
//     console.log(error);
//   }

// });




/**
 * POST /
 * Admin - Register
 */


// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       const user = await User.create({ username, password:hashedPassword });
//       res.status(201).json({ message: 'User Created', user })
//     } catch (error) {
//       if(error.code == 11000) {
//         res.status(409),json({ message: 'User already in use' });
//       }
//       res.status(500).json({ message: "Internal server error" })
//     }



//   } catch (error) {
//     console.log(error);
//   }

// });



