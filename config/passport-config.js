const passport = require('passport');
const bcrypt = require('bcrypt');

const UserModel = require('../models/user-model.js');

// serializeUser (controls what goes into the bowl) (save only the user's database ID in the bowl)\\
passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id);
});

// deserializeUser ( controls what you get when you check the bowl)
// (use the ID in the bowl to retrieve the user's information)
// (happens every time you visit the site after logging in)
passport.deserializeUser((idFromBowl, next) =>{
  UserModel.findById(
    idFromBowl,
    (err, userFromDb) => {
      if (err) {
        next(err);
        return;
      }

      next(null, userFromDb);

    }
  );
});


// Strategies ------------------------------------
    //the different ways to log in
// SETUP passport-local
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy (
  {                         //1st argument -> settings object
    usernameField: 'loginUsername',    // Must use these names for your form inputs
    passwordField: 'loginPassword'
  },

  (formUsername, formPassword, next) => {       // 2nd argument -> callack (will be called when a user tries to login )
    //1 Does the provided username exist?
    UserModel.findOne(
      { username: formUsername },
      (err, userFromDb) => {

        if (err) {
          next(err);
          return;
        }

        if (userFromDb === null) {
          // In passport, if you call next() with "false" in 2nd position, log in has failed
          next(null, false);
          return;
        }

        if (bcrypt.compareSync(formPassword, userFromDb.password) === false) {
          next(null, false);
          return;
        }

        // If we pass those if statements, LOGIN SUCCESS!

        next(null, userFromDb);

      }
    );
    //2 if there is a user with that username, is the password correct?
  }
));
//================ FACEBOOK =======
const FbStrategy = require('passport-facebook').Strategy;

passport.use (new FbStrategy(
  {                  // 1st argument -> settings object
    clientID: '',
    clientSecret: '',
    callbackURL: '/auth/facebook/callback'
  },

  (accessToken, refreshToken, profile, next) => {         // 2nd argument -> callback  (will be called when a user allows us to log them in with facebook)

    UserModel.findOne(
      { facebookId: profile.id },
      (err, userFromDb) => {
        // "userFromDb" will be empty if this is the first time the user logs in with facebookId

        if(err) {
          next(err);
          return;
        }

        if (userFromDb) {
          next(null, userFromDb);
          return;
        }

        const theUser = new UserModel ({
          facebookId: profile.id
        });

        theUser.save((err) => {
          if(err) {
            next(err);
            return;
          }

          // Now that they are saved, log them inx
          next(null, theUser);
        });
      }
    );
    //Receiving the Facebook user info and saving it
  }
));

// passport-googleoauth (log in with your google account)

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use (new GoogleStrategy(
  {                  // 1st argument -> settings object
    clientID: '',
    clientSecret: '',
    callbackURL: '/auth/google/callback'
  },

  (accessToken, refreshToken, profile, next) => {         // 2nd argument -> callback  (will be called when a user allows us to log them in with facebook)
    
    UserModel.findOne(
      { googleId: profile.id },
      (err, userFromDb) => {
        // "userFromDb" will be empty if this is the first time the user logs in with facebookId

        if(err) {
          next(err);
          return;
        }

        if (userFromDb) {
          next(null, userFromDb);
          return;
        }

        const theUser = new UserModel ({
          googleId: profile.id
        });


        theUser.save((err) => {
          if(err) {
            next(err);
            return;
          }

          // Now that they are saved, log them inx
          next(null, theUser);
        });
      }
    );
    //Receiving the Facebook user info and saving it
  }
));
