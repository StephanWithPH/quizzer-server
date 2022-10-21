const mongoose = require("mongoose");
const questions = require("./questions.json");
const Question = require("./models/question");

// Database connection
mongoose.connect('mongodb+srv://stephanwithph:stephanwithph123@quizzer.yy68h63.mongodb.net/?retryWrites=true&w=majority');

const insertQuestions = () => {
  Question.countDocuments({}, (err, c) => {
    if (c > 0) {
      Question.deleteMany({question: {$exists: true}}).then(() => {
        console.log("Old questions deleted");
      });
    }
    Question.insertMany(questions).then(() => {
      console.log("Questions inserted");
      console.log("# Questions inserted from file:", questions.length);
      mongoose.disconnect();
    });
  });
}

insertQuestions();
