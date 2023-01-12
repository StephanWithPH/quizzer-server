const mongoose = require('mongoose');
const Category = require('../models/category');

const questionSchema = new mongoose.Schema({
  question: {
    type: String, required: true, unique: true,
  },
  answer: {
    type: String, required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Category,
    required: true
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
