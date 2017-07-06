const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
  rating: {type: Number},
  comments: {type: String},
  author: { type: Schema.Types.ObjectId, ref: 'User'}
},
{
  timestamps: true
});

const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;
