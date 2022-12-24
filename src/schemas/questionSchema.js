const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String, required: true
  }, answer: {
    type: String, required: true
  }, category: {
    type: String, required: true
  }, image: {
    type: String, required: false
  }, date: {
    type: Date,
    default: Date.now
  }
});

module.exports = questionSchema;
