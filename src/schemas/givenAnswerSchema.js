const mongoose = require('mongoose');
const Team = require('../models/team');

const givenAnswerSchema = new mongoose.Schema({
    answer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Team,
        required: true
    }
});

module.exports = givenAnswerSchema;
