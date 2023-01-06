const Category = require('../models/category');

async function getCategories() {
  return Category.find().select('name');
}

async function getFilteredCategories(page = 1, perPage = 10, search = '') {
  const categories = await Category.find(search ? { name: { $regex: search, $options : 'i' } } : {})
    .limit(perPage)
    .skip(perPage * (page - 1))
    .sort({date: -1});
  // Add the total amount of questions to the category object from the questions that are in the object
  return categories.map(category => ({
    ...category.toObject(),
    questions: category.questions.length
  }));
}

async function createCategory(name) {
  return Category.create({ name });
}

module.exports = {
  getCategories,
  createCategory,
  getFilteredCategories,
}