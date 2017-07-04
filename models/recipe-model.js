const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema ({
  title: {
    type: String,
    required: [true, "Title is required"],
    maxlength: [30, "Please use no more than 30 characters in the title."]
  },
  prepTime: {
    hours: {type: Number},
    minutes: {type: Number},
  },
  cookingTime: {
    hours: {type: Number},
    minutes: {type: Number},
  },
  serves: {
    type: Number,
    maxlength: [20, "Please scale down your recipe to serve 20 or less."]
  },
  ingredients: {
    type: [String],
    required: [true, "Ingredients are required"]
  },
  recipe: {
    type: [String],
    required: [true, "Directions are required"]
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
