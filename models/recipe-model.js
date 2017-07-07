const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ReviewModel = require('./review-model.js');

const recipeSchema = new Schema ({
  title: {
    type: String,
    required: [true, "Title is required"],
    maxlength: [30, "Title can be no longer than 30 characters."]
  },
  prepTime: {
    hours: {type: Number},
    minutes: {type: Number,
              required: [true, "Prep Time required"],
              min: [0, "Minimum time of zero"],
              max: [59, "Use hours if greater than 1 hour."]},
  },
  cookingTime: {
    hours: {type: Number},
    minutes: {type: Number,
              min: [0, "Minimum time of zero"],
              max: [59, "If greater than 59, please use the hour selector."]},
  },
  serves: {
    type: Number,
    required: [true, "Field is required"]
  },
  ingredients: {
    type: [String],
    minlength: [1, "Ingredients are required"]
  },
  recipe: {
    type: [String],
    minlength: [1, "Directions are required"]
  },
  ethnicity: {
    type: String,
    enum: ["Cajun", "Chinese", "French", "Greek", "Indian", "Italian", "Japanese", "Thai", "Korean", "American", "Spanish", "Mexican", "Latin-American", "English", "German", "Vietnamese"]
  },
  rating: {type: Number, default: 4},
  author: { type: Schema.Types.ObjectId, ref: 'User'},
  photoURL: {type: String, default: "/images/default-recipe.png"},
  reviews: [ ReviewModel.schema ]
},
{
  timestamps: true
}
);

const RecipeModel = mongoose.model('Recipe', recipeSchema);

module.exports = RecipeModel;
