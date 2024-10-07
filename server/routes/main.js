const express = require('express');
const router = express.Router();
const userMade = require('../helpers/search')

// Get 
// Home Page

router.get('', async (req, res) => {
  try {
      const locals = {
          title: "WA Club Website",
          description: "See all the clubs here!"
      }

      res.render('index', { 
          locals
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

    
    //   const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
  
    //   const data = await Post.find({
    //       $or: [
    //           { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
    //           { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
    //       ]
    //   });
  
      res.render("search", {
          data,
          locals
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

module.exports = router;