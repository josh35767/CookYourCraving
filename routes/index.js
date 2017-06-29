const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/recipes', (req, res, next) => {
  res.render('recipes');
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

module.exports = router;
