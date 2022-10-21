const Question = require('../models/question');
const Quiz = require('../models/quiz');

function getCategoriesFromQuestions() {
  return Question.distinct('category');
}

async function getQuestionsByLobby(lobby) {
  const quiz = await Quiz.findOne({lobby: lobby}).select('rounds').populate('rounds.askedQuestions.question');
  const round = quiz.rounds[quiz.rounds.length - 1];
  const roundCategories = round.chosenCategories;
  const allAskedQuestions = quiz.rounds.map(round => round.askedQuestions);
  const mergedAskedQuestions = [].concat.apply([], allAskedQuestions);
  let questions = await Question.find({$and: [{
      // Find questions that haven't been asked yet
      _id: {$nin: mergedAskedQuestions.map(askedQuestion => askedQuestion.question._id)}
    }, {
      // Find questions that are in one of the chosen categories
      category: {$in: roundCategories}
    }]});

  // If all questions are already asked then return just all of them as a fallback
  if(questions.length === 0) {
    questions = await Question.find({category: {$in: roundCategories}});
  }

  return questions;
}

async function addAskedQuestion(lobby, roundId, questionId) {
  const quiz = await Quiz.findOne({lobby: lobby}).select('rounds').populate('rounds.askedQuestions.question');
  const round = quiz.rounds.id(roundId);
  const question = await Question.findOne({_id: questionId});
  round.askedQuestions.push({question: question});
  return quiz.save();
}

module.exports = {
  getCategoriesFromQuestions,
  getQuestionsByLobby,
  addAskedQuestion
}
