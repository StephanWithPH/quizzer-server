const mongoose = require('mongoose');
const roundSchema = require("./roundSchema");
const Team = require('../models/team');

const quizSchema = new mongoose.Schema({
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Team,
    }],
    lobby: {
        type: String,
        required: true,
    },
    rounds: {
        type: [roundSchema],
        required: true,
        default: []
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },
}, { timestamps: true });

module.exports = quizSchema;
