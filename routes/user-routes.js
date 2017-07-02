const express = require('express');
const UserModel = require('../models/user-model.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport = require('passport');

// ------------- SIGN UP ------------------------
router.get('/sign-up', (req, res, next) => {
  res.locals.bodyclass = "sign-up-body";
  res.render('auth-views/sign-up');
});

router.post('/sign-up', (req, res, next) => {

  if(req.body.password === "" || req.body.userName === "") {
    res.locals.errorMessage = "Username and password required.";
    res.locals.bodyclass = "sign-up-body";
    res.render('auth-views/sign-up');
    return;
  }

  if (req.body.password.length < 5 || req.body.password.length > 20) {
    res.locals.errorMessage = 'Password must be between 6 and 20 characters.';
    res.locals.bodyclass = "sign-up-body";
    res.render('auth-views/sign-up');
    return;
  }

  if (req.body.userName.length < 3 || req.body.userName.length > 25) {
    res.locals.errorMessage = 'Username must be between 3 and 25 characters.';
    res.locals.bodyclass = "sign-up-body";
    res.render('auth-views/sign-up');
    return;
  }

  if (req.body.password !== req.body.passwordConfirm) {
    res.locals.errorMessage = "Passwords do not match.";
    res.locals.bodyclass = "sign-up-body";
    res.render('auth-views/sign-up');
    return;
  }

  UserModel.findOne(
    {username: req.body.userName},
    (err, userFromDb) => {
      if (userFromDb) {
        res.locals.errorMessage = "Sorry but that username is taken.";
        res.locals.bodyclass = "sign-up-body";
        res.render('auth-views/sign-up');
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const encryptedPassword =  bcrypt.hashSync(req.body.password, salt);

      const theUser = new UserModel({
        username: req.body.userName,
        password: encryptedPassword
      });

      theUser.save((err) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect('/');
      });
    }
  );
});

// ------------- LOGIN ------------------------
router.get('/login', (req, res, next) => {
  res.locals.bodyclass = "login-body";
  res.render('auth-views/login-view.ejs');

});

router.post('/login', passport.authenticate(
  'local',          // 1st argument -> name of stategy
  {
    successRedirect: '/',
    failureRedirect: '/login'
  }
));


// ------------- LOGOUT ------------------------
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

// FACEBOOOK -------------------
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
passport.authenticate (
  'facebook',
    {
      successRedirect: '/',
      failureRedirect: '/login'
    }
  )
);

// GOOGLE --------------
router.get('/auth/google',
  passport.authenticate(
    'google',
      {
        scope : ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
      }
  )
);
router.get('/auth/google/callback',
passport.authenticate (
  'google',
    {
      successRedirect: '/',
      failureRedirect: '/login'
    }
  )
);

router.get('/profile', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
    return;
  }
  res.render('auth-views/user-profile.ejs');
});

module.exports = router;
