const Category = require('../models/category');

async function getCategories() {
  return Category.find().select('name');
}

module.exports = {
  getCategories,
}