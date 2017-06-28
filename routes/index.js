const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/recipes', (req, res, next) => {
  res.render('recipes');
});

module.exports = router;
