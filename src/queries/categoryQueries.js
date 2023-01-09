const Category = require('../models/category');
const Question = require('../models/question');

async function getCategories() {
  return Category.find().select('name');
}

async function getCategoryByName(name) {
  return Category.findOne({ name });
}

async function getFilteredCategories(page = 1, perPage = 10, search = '') {
  const categories = await Category.find(search ? { name: { $regex: search, $options : 'i' } } : {})
    .limit(perPage)
    .skip(perPage * (page - 1))
    .sort({date: -1});

  const allQuestions = await Question.find();

  return categories.map(category => ({
    ...category.toObject(),
    count: allQuestions.filter(question => question.category.toString() === category._id.toString()).length
  }));
}

async function createCategory(name) {
  return Category.create({ name });
}

async function deleteCategory(id) {
  const allQuestions = await Question.find();
  // Check if there are questions with this category
  if (allQuestions.some(question => question.category.toString() === id)) {
    // Remove all the questions from the array
    await Question.deleteMany({ category: id });
  }
  return Category.findByIdAndDelete(id);
}

module.exports = {
  getCategories,
  getCategoryByName,
  createCategory,
  getFilteredCategories,
  deleteCategory,
}