const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    roundPoints: {
        type: Number,
        required: true,
        default: 0
    },
    accepted: {
        type: Boolean,
        required: true,
        default: false
    },
    image: {
        type: String,
        required: false
    }
});

module.exports = teamSchema;
