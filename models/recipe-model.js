const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema ({
  title: {
    type: String
  },
  cookingTime: {
    type: Number
  },
  serves: {
    type: Number
  },
  ingredients: {
    type: String
  },
  recipe: {
    type: String
  },
  ethnicty: {
    type: String,
    enum: ["Cajun", "Chinese", "French", "Greek", "Indian", "Italian", "Japanese", "Thai", "Korean", "American", "Spanish/Latin American", "English", "German"]
  }
});

module.exports = recipeModel;
