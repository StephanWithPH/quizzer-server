const mongoose = require('mongoose');
const questionSchema = require("./questionSchema");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questions: {
    type: [questionSchema],
    required: true,
    default: []
  },
});

module.exports = categorySchema;