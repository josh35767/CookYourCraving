const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);
const RecipeModel = require('../models/recipe-model.js');
const UserModel = require('../models/user-model.js');
const bcrypt = require('bcrypt');

const salt = bcrypt.genSaltSync(10);
const encryptedPassword = bcrypt.hashSync("swordfish6787", salt);

const theUser = new UserModel ({
  displayName: "Josh Thomas",
  username: "admin",
  password: encryptedPassword
});

theUser.save((err, userInfo) => {
  if (err) {
    console.log("error");
    return;
  }

  const RecipeArray = [
    {
      title: "Chicken Cordon Bleu",
      prepTime: {
        hours: 0,
        minutes: 10
      },
      cookingTime: {
        hours: 0,
        minutes: 30
      },
      serves: 3,
      ingredients: ["Chicken", "Ham", "Bleu Cheese", "Oil"],
      recipe: ["Oil a pan and heat it up", "Butterfly the chicken",
              "Stuff the chicken with the ham and bleu cheese", "Place chicken on pan and cook until juices run clear" ],
      ethnicity: "French",
      author: userInfo._id,
      photoURL: "/images/cordonbleu.jpg"
    },
    {
      title: "General Tso's Chicken",
      prepTime: {
        hours: 0,
        minutes: 10
      },
      cookingTime: {
        hours: 0,
        minutes: 30
      },
      serves: 3,
      ingredients: ["Chicken", "Soy Sauce", "Flour", "Garlic", "Rice Wine Vinegar", "Brown Sugar", "Short Grain Rice"],
      recipe: ["Oil a pan and heat it up", "Boil 3 cups of water and place rice in water", "Flour the chicken and put in hot pan",
              "In a sauce pan mix soy sauce, garlic, rice wine vinegar, and brown sugar", "Once chicken is cooked, mix it wtth the soy sauce mix" ],
      ethnicity: "Chinese",
      author: userInfo._id,
      photoURL: "/images/generalchicken.jpg"
    },
    {
      title: "Greek Salad",
      prepTime: {
        hours: 0,
        minutes: 15
      },
      cookingTime: {
        hours: 0,
        minutes: 0
      },
      serves: 3,
      ingredients: ["Romaine Lettuce", "Red/Green Peppers", "Feta Cheese", "Olives", "Red Wine Vinegar", "Olive Oil"],
      recipe: ["Slowly wisk the vinegar into the olive oil to make a vinegarette.", "Thinnly slice the olives",
              "Chop the peppers about a quarter inch in size.", "Wash and chop the romaine lettuce",
              "Gently toss all the ingredients in a large mixing bowl" ],
      ethnicity: "Greek",
      author: userInfo._id,
      photoURL: "/images/greeksalad.jpg"
    },
    {
      title: "Spaghetti",
      prepTime: {
        hours: 0,
        minutes: 20
      },
      cookingTime: {
        hours: 2,
        minutes: 30
      },
      serves: 4,
      ingredients: ["Spagetti Noodles", "Plum Tomatoes", "Garlic", "Sweet Onion", "Italian Sausage", "Olive oil"],
      recipe: ["Put a small about of olive oil in a large sauce pot", "While the pan is heating, mince the garlic and fine dice the onion",
              "Cook the onions in the pan until just translucent", "Add the garlic to the pan just until the aroma is released",
              "Add the sausage into the pan, cooking until browned.", "Add the tomatoes, and let the sauce simmer for two hours",
              "After 2 hours, start boiling water, once boiling, add the noodles.", "Cook the noodles until al-dente, then add sauce."],
      ethnicity: "Italian",
      author: userInfo._id,
      photoURL: "/images/Italianstock.jpg"
    },
    {
      title: "Hamburgers",
      prepTime: {
        hours: 0,
        minutes: 5
      },
      cookingTime: {
        hours: 0,
        minutes: 20
      },
      serves: 3,
      ingredients: ["Ground Beef", "Buns", "Cheese"],
      recipe: ["Heat up the grill to 350 degrees", "Form beef into quarter-inch thick patties",
              "Generously add salt and pepper to both sides of the beef patty", "Once grill is hot, place them on the grill",
              "Cook burger for about 6 minutes on both sides for medium-rare", "Serve on a roll, with cheese of your choice." ],
      ethnicity: "American",
      author: userInfo._id,
      photoURL: "/images/burgers.jpeg"
    },
    {
      title: "Korean Short Ribs",
      prepTime: {
        hours: 8,
        minutes: 0
      },
      cookingTime: {
        hours: 0,
        minutes: 45
      },
      serves: 3,
      ingredients: ["Flanken style Short Ribs", "Soy Sauce", "Scallions", "Brown Sugar", "Garlic", "Ginger", "Sesame Seeds"],
      recipe: ["Mix soy sauce, chopped scallions, brown sugar, garlic, ginger, and sesame seeds in mixing bowl.",
                "Place marinade in shallow dish and marinate it for 8 hours, or over night.",
              "Heat up a grill to 300 degrees.", "Before grilling, take the ribs out of the marinade for about 10 minutes, and rest at room temperature",
              "Cook on grill until they reach an iternal temperature of 135 degrees."],
      ethnicity: "Korean",
      author: userInfo._id,
      photoURL: "/images/Koreanstock.jpg"
    },
    {
      title: "Steak Fajitas",
      prepTime: {
        hours: 6,
        minutes: 0
      },
      cookingTime: {
        hours: 0,
        minutes: 30
      },
      serves: 2,
      ingredients: ["Flank steak", "Limes", "Chili Powder", "Olive Oil", "Tortillas", "Bell Peppers", "Onion"],
      recipe: ["In a shallow pan cover the Flank Steak with lime juice, chili powder, olive oil, salt, and pepper", "Marinate the beef up to 4 hours.",
              "In a sautee pan, cook the sliced onion and bell peppers until tender.", "Grill the flank steak until it reaches an internal temperature of 135.",
              "Slice the beef thinly against the grain and mix with the vegetables, serve on warm tortillas."],
      ethnicity: "Mexican",
      author: userInfo._id,
      photoURL: "/images/fajita.jpeg"
    },
    {
      title: "Fish and Chips",
      prepTime: {
        hours: 0,
        minutes: 10
      },
      cookingTime: {
        hours: 0,
        minutes: 45
      },
      serves: 4,
      ingredients: ["Fresh Cod", "Flour", "Dark Beer", "Oil", "Potatoes"],
      recipe: ["Mix the flour, dark beer, salt, and pepper to make a light beer batter", "Slice in thin strips the potatoes and hold in cold water.",
              "Heat up a deep fryer to 350 degrees.", "Cover the cod in the batter and drop immediately in the fryer.",
              "Fry the fish until it reaches 145 degrees", "Pull out the fish and put on a wire rack",
              "Drop the slice potatoes in the fryer until golden-brown, season with salt and pepper." ],
      ethnicity: "English",
      author: userInfo._id,
      photoURL: "/images/fishandchips.jpg"
    },
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




});
