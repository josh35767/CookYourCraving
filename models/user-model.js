const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
  displayName: {type: String},
  username: {type: String},
  password: {type: String},
  facebookId: {type: String},
  googleId: {type: String},
  bookmarks: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],
  photoURL: {
    type: String,
    default: "/images/default-profile.png"
  }
},
{
  timestamps: true
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
