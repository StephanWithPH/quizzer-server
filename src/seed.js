const mongoose = require("mongoose");
const questions = require("./questions.json");
const Category = require("./models/category");
require('dotenv').config({
  path: '../.env'
});

// Database connection
mongoose.connect(process.env.DATABASE_URL);

const insertQuestions = async () => {
  await Category.deleteMany({name: {$exists: true}});
  console.log("Categories & questions deleted");
  // Get distinct categories
  const insertCategories = [...new Set(questions.map(q => q.category))];
  console.log("Categories to insert: ", insertCategories);

  // Remove duplicate questions
  const uniqueQuestions = questions.filter((q, i, arr) => {
    return arr.findIndex(t => t.question === q.question) === i;
  });
  console.log("Questions to insert: ", uniqueQuestions.length);

  for (const category of insertCategories) {
    const categoryQuestions = uniqueQuestions.filter(q => q.category === category);
    const newCategory = new Category({
      name: category,
      questions: categoryQuestions
    });
    await newCategory.save();
  }
  console.log("Categories & questions inserted");

}

insertQuestions().then(() => {
  console.log("Finished");
  mongoose.disconnect();
});



// Used for filtering out duplicate questions from original questions.json

// const getQuestions = async () => {
//   const dbQuestions = await Question.find({}, {_id: 0, __v: 0, date: 0}).populate("category");
//
//   return dbQuestions.map(q => {
//     return {
//       question: q.question,
//       answer: q.answer,
//       category: q.category.name
//     }
//   });
// }
// getQuestions().then((questions) => {
//   fs.writeFile("new_questions.json", JSON.stringify(questions), (err) => {
//     if (err) throw err;
//     console.log("Questions saved");
//   });
//   mongoose.disconnect();
// });