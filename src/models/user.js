const mongoose = require('mongoose');
const userSchema = require("../schemas/userSchema");

const user = mongoose.model('User', userSchema);

module.exports = user;
