const express = require('express');
const router = express.Router();


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

module.exports = router;