const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
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