const express = require('express');
const UserModel = require('../models/user-model.js');
const RecipeModel = require('../models/recipe-model.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport = require('passport');
const validator = require('validator');



// ------------- SIGN UP ------------------------
router.get('/sign-up', (req, res, next) => {
  res.locals.bodyclass = "sign-up-body";
  res.render('auth-views/sign-up');
});

router.post('/sign-up', (req, res, next) => {

  if(validator.isEmpty(req.body.password) || validator.isEmpty(req.body.userName)) {
    res.locals.errorMessage = "Username and password required.";
    res.locals.bodyclass = "sign-up-body";
    res.render('auth-views/sign-up');
    return;
  }

  if (!validator.isLength(req.body.password, {min: 6, max: 20})) {
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

  if (req.body.displayName.length < 3 || req.body.displayName.length > 25) {
    res.locals.errorMessage = 'Display Name must be between 3 and 25 characters.';
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
        displayName: req.body.displayName,
        username: req.body.userName,
        password: encryptedPassword
      });

      theUser.save((err) => {
        if (err) {
          next(err);
          return;
        }
        res.redirect('/login');
      });
    }
  );
});

// ------------- LOGIN ------------------------
router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  res.locals.bodyclass = "login-body";
  res.render('auth-views/login-view.ejs');

});

router.post('/login', passport.authenticate(
  'local',          // 1st argument -> name of stategy
  {
    successRedirect: '/',
    failureRedirect: '/login',
  }
));

// ---------------- Add display name ------------
router.get('/displayname', (req, res, next) => {
  res.locals.bodyclass = "display-name-body";
  res.render('auth-views/display-name');
});

router.post('/displayname', (req, res, next) => {
  if (req.body.displayName.length < 3 || req.body.displayName.length > 25) {
    res.locals.errorMessage = 'Display Name must be between 3 and 25 characters.';
    res.locals.bodyclass = "display-name-body";
    res.render('auth-views/display-name');
    return;
  }

  UserModel.findByIdAndUpdate(
    req.user._id,
    {displayName: req.body.displayName},
    (err, someUser) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/profile/' + someUser._id);
    }
  );
});
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
passport.authenticate ('google', { failureRedirect: '/login'}),
  function(req, res) {
    if (!req.user.displayName) {
       res.redirect('/displayname');
    }
  res.redirect('/');
});


router.get('/profile/:userId', (req, res, next) => {
  res.locals.bodyclass = "profile-body";
  UserModel
  .findById(req.params.userId)
  .populate('bookmarks')
  .exec(
    (err, userInfo) => {
      let isOwnProfile = false;

      if (req.isAuthenticated()) {
        isOwnProfile = userInfo._id.equals(req.user._id);
      }

      if(err) {
        next(err);
      }
      console.log(userInfo);
      RecipeModel.find(
        {author: req.params.userId},
        (err, recipeDetails) => {
          if (err) {
            next(err);
            return;
          }
          const uniqueEthnicity = [...new Set(recipeDetails.map(recipe => recipe.ethnicity))];
          const uniqueBookMarkedEthnicity = [...new Set(userInfo.bookmarks.map(recipe => recipe.ethnicity))];
          res.render('auth-views/user-profile.ejs',
            {
              ethnicityList: uniqueEthnicity,
              recipeDetails: recipeDetails,
              userDetails: userInfo,
              isOwnProfile: isOwnProfile,
              bookMarkedList: uniqueBookMarkedEthnicity
            }
          );


        }
      );
  });
});

const multer = require('multer');

const myUploader = multer({
  dest: __dirname + '/../public/uploads'
});

router.post(
  '/profile-picture',
  myUploader.single('profilePicture'),
  (req, res, next) => {
    UserModel.findByIdAndUpdate(
      req.user._id, {
        photoURL: "/uploads/"+req.file.filename
      },
      (err, userInfo) => {

      }
    );
    res.redirect('/profile/'+req.user._id);
  }
);



module.exports = router;
