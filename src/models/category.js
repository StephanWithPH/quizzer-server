const mongoose = require('mongoose');
const categorySchema = require("../schemas/categorySchema");

const category = mongoose.model('Category', categorySchema);

module.exports = category;