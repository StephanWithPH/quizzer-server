const mongoose = require('mongoose');
const Category = require('../models/category');

const questionSchema = new mongoose.Schema({
  question: {
    type: String, required: true, unique: true, sparse: true
  },
  answer: {
    type: String, required: true
  },
  image: {
    type: String, required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = questionSchema;
