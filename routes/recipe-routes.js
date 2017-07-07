const express = require('express');
const RecipeModel = require("../models/recipe-model.js");
const UserModel = require("../models/user-model.js");
const ReviewModel = require("../models/review-model.js");
const router  = express.Router();
const foodCategories = RecipeModel.schema.path('ethnicity').enumValues; // All the possible ethnic types, declared by the Recipe Schema

// List of Recipe Ethnicity ========================

router.get('/recipes', (req, res, next) => {
  res.locals.bodyclass = "list-bg";
  res.render('recipe-views/recipes');
});

// New Recipe ========================



router.get('/recipes/new', (req, res, next) => {
  res.locals.bodyclass = "recipe-new-body";
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
    if (typeof req.file === "object") {  // checks if user uploaded picture, otherwise, it's default
      photoPicture = "/uploads/"+req.file.filename;
    }

  const ingredientsArray = decodeURIComponent(req.body.recipeIngredients).split(/\r\n?|\n/); // Splits line breaks into array
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

      if(err && newRecipe.errors) {  // Validation checker
        res.locals.titleValidationError = newRecipe.errors.title;
        res.locals.servesValidationError = newRecipe.errors.serves;
        res.locals.prepTimeValidationError = newRecipe.errors['prepTime.minutes'];
        res.locals.cookingTimeValidationError = newRecipe.errors['cookingTime.minutes'];
        res.render('recipe-views/recipe-new.ejs');
        console.log(newRecipe.errors);
        return;
      }

        res.redirect('/recipes/' + oneRecipe.ethnicity + '/' + oneRecipe._id);
    });
});

// Search ==============
router.get('/search/:page?', (req, res, next) => {
  let currentPage = Number(req.params.page) || 1;
  let searchTerm = new RegExp(req.query.searchValue, 'ig');
  const page = Number(req.params.page) - 1;
  let limitAmount = 16;           // Limits amount of recipes per page to 16
  RecipeModel
    .find({title: searchTerm})
    .count()
    .exec(
    (err, count) => {
      if (err) {
        next(err);
        return;
      }
      RecipeModel.find({title: searchTerm})
      .skip(page*limitAmount)
      .limit(limitAmount)
      .sort({ rating: -1  })
      .exec(
      (err, recipeArray) => {
        if (err) {
          next(err);
          return;
        }

        res.render('recipe-views/recipesbySearch.ejs',{
          recipeArray: recipeArray,
          keyWord: req.query.searchValue,
          pageCount: Math.ceil(count/limitAmount),
          currentPage: currentPage
        });

      }
    );
  });
});


// List of Recipe in Specific Ethnicity ========================

router.get('/recipes/:ethnicity/results/:page?', (req, res, next) => {
  let currentPage = Number(req.params.page) || 1;
  const page = Number(req.params.page) - 1;
  let limitAmount = 16;
  RecipeModel.find({ethnicity: req.params.ethnicity}, '_id') // Gets the amount of recipes in given ethnicity, to show pagination buttonss
  .count()
  .exec(
  (err, count) => {
  if(err) {
    next(err);
    return;
  }
    RecipeModel
    .find({ethnicity: req.params.ethnicity})    // Limits results based on earlier specified limit amount
    .skip(page*limitAmount) //
    .limit(limitAmount)
    .sort({ rating: -1  })
    .exec(
      (err, recipeArray) => {
        if (err) {
          next(err);
          return;
        }
        res.locals.paginationLink = `/recipes/${req.params.ethnicity}/results/`;
        res.locals.userTitle = `${req.params.ethnicity} Cuisine`;
        res.render('recipe-views/recipesbyEthnicity.ejs',{
          recipeArray: recipeArray,
          recipeEthnicity: req.params.ethnicity,
          pageCount: Math.ceil(count/limitAmount),
          currentPage: currentPage
        });
      }
    );
  });


});

// Edit of Recipe ========================

router.get('/recipes/:ethnicity/:recipeId/edit', (req, res, next) => {
  res.locals.bodyclass = "recipe-new-body";
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

// ============ User's Recipe by ethnicity

router.get('/profile/recipes/:userId/:ethnicity/:page?', (req, res, next) => {
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

  let currentPage = Number(req.params.page) || 1;
  const page = Number(req.params.page) - 1;
  let limitAmount = 16;
  RecipeModel
    .find({author: req.params.userId, ethnicity: req.params.ethnicity}, '_id') // Gets the amount of recipes in given ethnicity, to show pagination buttonss
    .count()
    .exec(
      (err, count) => {
      if(err) {
        next(err);
        return;
      }
      RecipeModel.find(
        {ethnicity: req.params.ethnicity,
        author: req.params.userId})
        .skip(page*limitAmount)
        .limit(limitAmount)
        .sort({ rating: -1  })
        .exec(
        (err, recipeArray) => {
          if (err) {
            next(err);
            return;
          }
          res.locals.paginationLink = `/profile/recipes/${userProfile._id}/${req.params.ethnicity}/`;
          res.locals.userTitle = `${userProfile.displayName}'s ${req.params.ethnicity} Recipes`;
          res.render('recipe-views/recipesbyEthnicity.ejs',{
            recipeArray: recipeArray,
            recipeEthnicity: req.params.ethnicity,
            pageCount: Math.ceil(count/limitAmount),
            currentPage: currentPage
          });

      }
  );
});
});




// Details of Recipe ========================

router.get('/recipes/:ethnicity/:recipeId/:page?', (req, res, next) => {
  const currentpage = req.params.page || 1;
  const page = Number(req.params.page) - 1;
  const skip = page * 5;
  res.locals.bodyclass = "details-body";
  res.locals.currentPage = Number(currentpage);
  let isBookMarked = false;
  RecipeModel
    .findById(req.params.recipeId, {reviews: {$slice: [skip, 5]}})
    .populate('author reviews.author')
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

// Bookmarked Pages

router.get('/profile/bookmarked/:userId/:ethnicity/:page?', (req, res, next) => {
  let currentPage = Number(req.params.page) || 1;
  const page = Number(req.params.page) - 1;
  let limitAmount = 16;
  UserModel
    .findById(req.params.userId)
    .populate({path: 'bookmarks', match: {'ethnicity': req.params.ethnicity}})
    .exec(// Gets the amount of recipes in given ethnicity, to show pagination buttonss
    (err, userInfo) => {
      if(err) {
        next(err);
        return;
      }
      let count = userInfo.bookmarks.length;
      console.log(count);
      RecipeModel
        .find({_id: userInfo.bookmarks, ethnicity: req.params.ethnicity})
        .skip(page*limitAmount)
        .limit(limitAmount)
        .sort({ rating: -1  })
        .exec(
          (err, recipeArray) => {
            if (err) {
              next(err);
              return;
            }
            res.locals.paginationLink = `/profile/bookmarked/${userInfo._id}/${req.params.ethnicity}/`;
            res.locals.userTitle = `${userInfo.displayName}'s' ${req.params.ethnicity} Bookmarks`;
            res.render('recipe-views/recipesbyEthnicity.ejs',{
              recipeArray: recipeArray,
              recipeEthnicity: req.params.ethnicity,
              pageCount: Math.ceil(count/limitAmount),
              currentPage: currentPage
            });
          }
        );
      });


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

//Add review

router.post("/recipes/:ethnicity/:recipeId/addReview", (req, res, next) => {
  RecipeModel.findById(
    req.params.recipeId,
    (err, recipeDetails) => {
      if(err) {
        next(err);
        return;
      }
      let reviewAverage = 0;
      let hasPost = false;
      let reviewSum = 0;




        recipeDetails.reviews.forEach ((oneReview) => {
          console.log("One rating" + oneReview.rating);
          if(oneReview.author.equals(req.user._id)) {
            hasPost = true;
          }
          reviewSum += oneReview.rating;

        });
      reviewSum += Number(req.body.reviewRating);
      console.log("sum" + reviewSum);
      reviewAverage = reviewSum / (recipeDetails.reviews.length + 1);
      console.log("Average" + reviewAverage);
      if (recipeDetails.reviews.length === 0) {
        reviewAverage = req.body.reviewRating;
      }

      console.log(reviewAverage);
      RecipeModel.findByIdAndUpdate(req.params.recipeId, {
        "$set": {rating: reviewAverage},
      }, (err) => {
        if(err) {
          next(err);
          return;
        }
        if (hasPost) {
          res.redirect('/login');
          return;
        }


        const newReview = new ReviewModel({
          rating: Number(req.body.reviewRating),
          comments: req.body.reviewComments,
          author: req.user._id
        });

        recipeDetails.reviews.push(newReview);

        recipeDetails.save((err) => {
          if(err){
            next(err);
            return;
          }

          res.redirect(`/recipes/${recipeDetails.ethnicity}/${recipeDetails._id}`);
        });

      });


    }
  );
});

// =========== search


module.exports = router;
