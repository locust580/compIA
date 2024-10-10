const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const searchFor = require('../helpers/search');

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

module.exports = router;

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