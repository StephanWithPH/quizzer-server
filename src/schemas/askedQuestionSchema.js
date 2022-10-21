const mongoose = require('mongoose');
const givenAnswerSchema = require("./givenAnswerSchema");
const Question = require('../models/question');

const askedQuestionSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Question
    },
    givenAnswers: {
        type: [givenAnswerSchema],
        required: true,
        default: []
    },
    closed: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = askedQuestionSchema;
