const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
  username: {type: String},
  password: {type: String},
  facebookId: {type: String},
  googleId: {type: String}
},
{
  timestamps: true
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
