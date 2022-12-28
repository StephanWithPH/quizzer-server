const mongoose = require("mongoose");
const questions = require("./questions.json");
const Question = require("./models/question");
const Category = require("./models/category");
require('dotenv').config({
  path: '../.env'
});

// Database connection
mongoose.connect(process.env.DATABASE_URL);

const insertQuestions = async () => {
  await Category.deleteMany({name: {$exists: true}});
  console.log("Categories deleted");
  await Question.deleteMany({question: {$exists: true}})
  console.log("Old questions deleted");
  // Get distinct categories
  const insertCategories = [...new Set(questions.map(q => q.category))];
  await Category.insertMany(insertCategories.map(c => ({name: c})))
  console.log("Categories created");

  // Insert questions with category ids
  const categories = await Category.find({});
  const categoryMap = {};

  categories.forEach(c => categoryMap[c.name] = c._id);
  await Question.insertMany(questions.map(q => ({
    question: q.question,
    answer: q.answer,
    category: categoryMap[q.category],
  })));
  console.log("Questions created with linked categories");
}

insertQuestions().then(() => {
  console.log("Finished");
  mongoose.disconnect();
});
