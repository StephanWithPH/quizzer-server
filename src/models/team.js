const mongoose = require('mongoose');
const teamSchema = require("../schemas/teamSchema");

const team = mongoose.model('Team', teamSchema);

module.exports = team;
