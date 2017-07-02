const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose = require('mongoose');
const RecipeModel = require('./models/recipe-model.js');
const session      = require('express-session');
const passport     = require('passport');
require('./config/passport-config.js');

mongoose.connect("mongodb://localhost/recipe-db");


const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Cooking your Cravings';
app.locals.bodyclass = 'someClass';
app.locals.foodCategories = RecipeModel.schema.path('ethnicty').enumValues;

// uncomment after placing your favicon in /public
// ------------------------------ Middlewares -------------------------
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
  secret: 'recipePassportKey',
  resave: true,
  saveUninitialized: true
})); // 2 parentheses: 1 for "app.use" and another for "session"
// PASSPORT middlewars MUST GO AFTER SESSION MIDDLEWARE---------------
app.use(passport.initialize());
app.use(passport.session());
// --------------------------------------------------------
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }

  next();
});


// ------------------- ROUTES --------------------
const index = require('./routes/index');
app.use('/', index);
const userRoute = require('./routes/user-routes.js');
app.use('/', userRoute);
const recipeRoute = require('./routes/recipe-routes.js');
app.use('/', recipeRoute);
//------------------------------------------------

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
