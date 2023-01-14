const mongoose = require('mongoose');
const {countImagesSync, findImageByRandomNumberSync} = require("../helpers/imageHelper");

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
                const amountOfImages = countImagesSync('teamplaceholders');
                const randomNumber = Math.floor(Math.random() * amountOfImages) + 1;
                const image = findImageByRandomNumberSync('teamplaceholders', randomNumber);

                if (image) {
                    return `/static/images/teamplaceholders/${image}`;
                }
                return undefined;
            }
            return undefined;
        }
    },
}, {timestamps: true});

module.exports = teamSchema;
