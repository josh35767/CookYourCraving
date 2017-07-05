const express = require('express');
const RecipeModel = require("../models/recipe-model.js");
const UserModel = require("../models/user-model.js");
const router  = express.Router();
const foodCategories = RecipeModel.schema.path('ethnicity').enumValues; // All the possible ethnic types, declared by the Recipe Schema

// List of Recipe Ethnicity ========================

router.get('/recipes', (req, res, next) => {
  res.render('recipe-views/recipes');
});

// New Recipe ========================



router.get('/recipes/new', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return;
  }
  if (!req.user.displayName) {
    res.redirect('/displayName');
    return;
  }
  res.render('recipe-views/recipe-new.ejs');
});


const multer = require('multer');

const myUploader = multer({
  dest: __dirname + '/../public/uploads'
});

router.post(
  '/recipes/new',
  myUploader.single('recipePicture'),
  (req, res, next) => {

  let photoPicture = "/images/default-recipe.png";
    if (typeof req.file === "object") {
      photoPicture = "/uploads/"+req.file.filename;
    }
  const ingredientsArray = decodeURIComponent(req.body.recipeIngredients).split(/\r\n?|\n/);
  const recipeArray = decodeURIComponent(req.body.recipeRecipe).split(/\r\n?|\n/);
  const newRecipe = new RecipeModel ({
    title: req.body.recipeTitle,
    cookingTime: {
      hours: req.body.recipeCookingTimeHours,
      minutes: req.body.recipeCookingTimeMinutes,
    },
    prepTime: {
      hours: req.body.recipePrepTimeHours,
      minutes: req.body.recipePrepTimeMinutes,
    },
    serves: req.body.recipeServings,
    ingredients: ingredientsArray,
    recipe: recipeArray,
    ethnicity: req.body.recipeEthnicity,
    author: req.user._id,
    photoURL: photoPicture
  });
    newRecipe.save((err, oneRecipe) => {
      if(err && newRecipe.errors === undefined) {
        next(err);
        return;
      }

      if(err && newRecipe.errors) {
        console.log(newRecipe.errors);
        console.log(newRecipe.errors.prepTime);
        res.locals.titleValidationError = newRecipe.errors.title;
        res.locals.prepTimeValidationError = newRecipe.errors.prepTime;
        res.locals.cookTimeValidationError = newRecipe.errors.cookingTime;
        res.locals.servesValidationError = newRecipe.errors.serves;
        res.locals.ingredientsValidationError = newRecipe.errors.ingredients;
        res.locals.recipeValidationError = newRecipe.errors.recipe;

        res.render('recipe-views/recipe-new.ejs');
        return;
      }

        res.redirect('/recipes/' + oneRecipe.ethnicity + '/' + oneRecipe._id);
    });
});

// List of Recipe in Specific Ethnicity ========================

router.get('/recipes/:ethnicity', (req, res, next) => {
  RecipeModel.find(
    {ethnicity: req.params.ethnicity},
    (err, recipeArray) => {
      if (err) {
        next(err);
        return;
      }
      res.locals.userTitle = `${req.params.ethnicity} Cuisine`;
      res.render('recipe-views/recipesbyEthnicity.ejs',{
        recipeArray: recipeArray,
        recipeEthnicity: req.params.ethnicity
      });

    }
  );

});

// Details of Recipe ========================

router.get('/recipes/:ethnicity/:recipeId', (req, res, next) => {
  res.locals.bodyclass = "details-body";
  let isBookMarked = false;
  RecipeModel
    .findById(req.params.recipeId)
    .populate('author')
    .exec((err, recipeDetails) => {
      if (err) {
        next(err);
        return;
      }

      if (req.isAuthenticated()) {
        isBookMarked = req.user.bookmarks.some((bookmark) => {
          return bookmark.equals(recipeDetails._id);
        });
      }

      res.render('recipe-views/recipe-details.ejs', {
        recipeDetails: recipeDetails,
        isBookMarked: isBookMarked
      });
    });


});

// Edit of Recipe ========================

router.get('/recipes/:ethnicity/:recipeId/edit', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return;
  }

  RecipeModel.findById (
    req.params.recipeId,
    (err, recipeDetails) => {
      if (err) {
        next(err);
        return;
      }

      if(req.user._id.toString() !== recipeDetails.author.toString()) {
        res.redirect("/recipes/"+recipeDetails.ethnicity+"/"+recipeDetails._id+"/");
        return;
      }
      res.render('recipe-views/recipe-edit.ejs', {
        recipeDetails: recipeDetails
      });
    }
  );
});

router.post('/recipes/:ethnicity/:recipeId/update', (req, res, next) => {
  const ingredientsArray = decodeURIComponent(req.body.recipeIngredients).split(/\r\n?|\n/);
  const recipeArray = decodeURIComponent(req.body.recipeRecipe).split(/\r\n?|\n/);
  RecipeModel.findByIdAndUpdate (
    req.params.recipeId, {
      title: req.body.recipeTitle,
      cookingTime: {
        hours: req.body.recipeCookingTimeHours,
        minutes: req.body.recipeCookingTimeMinutes,
      },
      prepTime: {
        hours: req.body.recipePrepTimeHours,
        minutes: req.body.recipePrepTimeMinutes,
      },
      serves: req.body.recipeServings,
      ingredients: ingredientsArray,
      recipe: recipeArray,
      ethnicity: req.body.recipeEthnicity,
      author: req.user._id
    },
    (err, oneRecipe) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/recipes/' + oneRecipe.ethnicity + '/' + oneRecipe._id);
    }
  );
});

router.post(
  '/recipes/:ethnicity/:recipeId/updatepicture',
  myUploader.single('recipePicture'),
  (req, res, next) => {
    RecipeModel.findByIdAndUpdate(
      req.params.recipeId, {
        photoURL: "/uploads/"+req.file.filename
      },
      (err, userInfo) => {

      }
    );
    res.redirect(`/recipes/${req.params.ethnicity}/${req.params.recipeId}`);
  }
);


// =================== DELETE RECIPE ====================

router.get('/recipes/:ethnicity/:recipeId/delete', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
    return;
  }

  RecipeModel.findById(
    req.params.recipeId,
    (err, recipeDetails) => {
      if (err) {
        next(err);
        return;
      }

      if (!recipeDetails.author.equals(req.user._id)) {
        res.redirect(`/recipes/${recipeDetails.ethnicity}/${recipeDetails._id}/`);
        return;
      }

      recipeDetails.remove((err) => {
        if (err) {
          next(err);
          return;
        }

        res.redirect('/recipes/'+recipeDetails.ethnicity);
      });


    }
  );
});

// User's Recipe by ethnicity
router.get('/profile/recipes/:userId/:ethnicity', (req, res, next) => {
  let userProfile;
  UserModel.findById(
    req.params.userId,
    (err, userInfo) => {
      if(err) {
        next(err);
        return;
      }

      userProfile = userInfo;
    }
  );
  RecipeModel.find(
    {ethnicity: req.params.ethnicity,
    author: req.params.userId},
    (err, recipeArray) => {
      if (err) {
        next(err);
        return;
      }

      res.locals.userTitle = `${userProfile.displayName}'s ${req.params.ethnicity} Recipes`;
      res.render('recipe-views/recipesbyEthnicity.ejs',{
        recipeArray: recipeArray,
        recipeEthnicity: req.params.ethnicity
      });

    }
  );

});

router.get('/profile/bookmarked/:userId/:ethnicity', (req, res, next) => {
  UserModel
    .findById(req.params.userId)
    .populate('bookmarks', null, {ethnicity: req.params.ethnicity})
    .exec(
      (err, userInfo) => {
        console.log(userInfo);
        if (err) {
          next(err);
          return;
        }

        res.locals.userTitle = `${userInfo.displayName}'s ${req.params.ethnicity} Bookmarks`;
        res.render('recipe-views/recipesbyEthnicity.ejs',{
          recipeArray: userInfo.bookmarks,
          recipeEthnicity: req.params.ethnicity
        });

    }
  );

});

router.post('/recipes/:ethnicity/:recipeId/bookmark',(req, res, next) => {

  req.user.bookmarks.push(req.params.recipeId);

  req.user.save((err) => {
    if(err) {
      next(err);
      return;
    }
    res.redirect(`/recipes/${req.params.ethnicity}/${req.params.recipeId}`);
  });
});

router.post('/recipes/:ethnicity/:recipeId/removeBookmark',(req, res, next) => {

  UserModel.update(
    {_id: req.user._id},
    { $pullAll: {bookmarks: [req.params.recipeId] } },
    (err) => {
      if(err) {
        next(err);
        return;
      }
      res.redirect(`/recipes/${req.params.ethnicity}/${req.params.recipeId}`);
    }
   );




});


module.exports = router;
