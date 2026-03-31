const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true 
  },
  role: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema, 'users');

exports.findByEmail = function(email) {
  return User.findOne({ email: email });
};

exports.createAccount = function(newAcc) {
  return User.create(newAcc);
};

exports.findByUsername = function(username) {
    return User.findOne({username: username})
};

exports.editParticulars = function(userId, updateDocument) {
  console.log(userId)
  return User.updateOne(userId, updateDocument)
};

exports.deleteAccount = function(userId) {
  return User.deleteOne({_id: userId})
};