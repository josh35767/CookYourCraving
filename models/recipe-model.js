const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
              max: [59, "If greater than 59, please use the hour selector."]},
  },
  cookingTime: {
    hours: {type: Number},
    minutes: {type: Number,
              min: [0, "Minimum time of zero"],
              max: [59, "If greater than 59, please use the hour selector."]},
  },
  serves: {
    type: Number,
    max: [20, "Please scale down your recipe to serve 20 or less."]
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
    enum: ["Cajun", "Chinese", "French", "Greek", "Indian", "Italian", "Japanese", "Thai", "Korean", "American", "Spanish", "Mexican", "Latin-American", "English", "German"]
  },
  author: { type: Schema.Types.ObjectId, ref: 'User'},
  photoURL: {type: String, default: "/images/default-recipe.png"}
},
{
  timestamps: true
}
);

const RecipeModel = mongoose.model('Recipe', recipeSchema);

module.exports = RecipeModel;
