const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/recipe-db");
const RecipeModel = require('../models/recipe-model.js');

const RecipeArray = [
  {
    title: "Pizza And Amazing Super Stuff",
    cookingTime: 60,
    serves: 4,
    ingredients: ["Cheese", "Sauce", "Crust"],
    recipe: ["Cook Pizza."],
    ethnicity: "Italian"
  },
  {
    title: "Spaghetti",
    cookingTime: 40,
    serves: 2,
    ingredients: [ "Sauce", "Noodles"],
    recipe: ["Cook Noodles", "Cook Sauce", "Mix"],
    ethnicity: "Italian"
  },
  {
    title: "General Tso's",
    cookingTime: 30,
    serves: 1,
    ingredients: ["Chicken", "Soy Sauce", "Rice"],
    recipe: ["Sautee the Chicken", "Toss in Sauce", "Cook Rice"],
    ethnicity: "Chinese"
  },
  {
    title: "Curry",
    cookingTime: 60,
    serves: 4,
    ingredients: ["Curry", "Chicken", "Rice"],
    recipe: ["Cook Curry.", "Add Chicken"],
    ethnicity: "Indian"
  }
];

RecipeModel.create(
  RecipeArray,
  (err, newRecipe) => {
    if (err) {
      console.log("error");
      return;
    }

    newRecipe.forEach((oneRecipe) => {
      console.log(oneRecipe.title + ' has been created.');
    });

  }
);
