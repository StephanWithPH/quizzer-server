const mongoose = require('mongoose');
const askedQuestionSchema = require("./askedQuestionSchema");

const roundSchema = new mongoose.Schema({
    askedQuestions: {
        type: [askedQuestionSchema],
        required: true,
        default: []
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },
    chosenCategories: {
        type: [String],
        required: true,
        default: []
    }
});

module.exports = roundSchema;