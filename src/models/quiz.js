const mongoose = require('mongoose');
const quizSchema = require("../schemas/quizSchema");

const quiz = mongoose.model('Quiz', quizSchema);

module.exports = quiz;
