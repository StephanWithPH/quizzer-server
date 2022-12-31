const mongoose = require('mongoose');
const {countImagesSync} = require("../helpers/imageHelper");

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
        required: false,
        default: () => {
            if (process.env.RANDOM_TEAM_IMAGES) {
                let amountOfImages = countImagesSync('teamplaceholders');
                const randomNumber = Math.floor(Math.random() * amountOfImages) + 1;
                return `/static/images/teamplaceholders/${randomNumber}.jpg`
            }
            return undefined;
        }
    },
    date: {
      type: Date,
      default: Date.now
    }
});

module.exports = teamSchema;
