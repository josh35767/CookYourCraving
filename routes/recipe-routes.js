const express = require('express');
const RecipeModel = require("../models/recipe-model.js");
const router  = express.Router();
const foodCategories = RecipeModel.schema.path('ethnicty').enumValues; // All the possible ethnic types, declared by the Recipe Schema


router.get('/recipes', (req, res, next) => {
  res.render('recipe-views/recipes');
});

router.get('/recipes/new', (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
  }
  res.render('recipe-views/recipe-new.ejs');
});

router.get('/recipes/:ethnicty', (req, res, next) => {
  RecipeModel.find(
    {ethnicty: req.params.ethnicty},
    (err, recipeArray) => {
      if (err) {
        next(err);
        return;
      }
      res.render('recipe-views/recipesbyEthnicity.ejs',{
        recipeArray: recipeArray,
        recipeEthnicty: req.params.ethnicty
      });

    }
  );

});

router.get('/recipes/:ethnicty/:recipeId', (req, res, next) => {
  RecipeModel.findById (
    req.params.recipeId,
    (err, recipeDetails) => {
      if (err) {
        next(err);
        return;
      }
      res.render('recipe-views/recipe-details.ejs', {
        recipeDetails: recipeDetails
      });
    }
  );
});

router.post('/recipes/new', (req, res, next) => {
  const ingredientsArray = decodeURIComponent(req.body.recipeIngredients).split(/\r\n?|\n/);
  const recipeArray = decodeURIComponent(req.body.recipeRecipe).split(/\r\n?|\n/);
  const newRecipe = new RecipeModel ({
    title: req.body.recipeTitle,
    cookingTime: req.body.recipeTime,
    serves: req.body.recipeServings,
    ingredients: ingredientsArray,
    recipe: recipeArray,
    ethnicty: req.body.recipeEthnicty,
    author: req.user._id
  });
    newRecipe.save((err, oneRecipe) => {
      if(err) {
        next(err);
        return;
      }

        res.redirect('/recipes/' + oneRecipe.ethnicty + '/' + oneRecipe._id);
    });
});



module.exports = router;
