const mongoose = require('mongoose');
const questionSchema = require("../schemas/questionSchema");

const question = mongoose.model('Question', questionSchema);

module.exports = question;
