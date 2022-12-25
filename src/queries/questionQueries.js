const Question = require('../models/question');
const Quiz = require('../models/quiz');

function getCategoriesFromQuestions() {
  return Question.distinct('category');
}

async function getQuestionById(id) {
  return Question.findById(id);
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

async function createQuestion(question, answer, category, image) {
  return Question.create({
    question: question,
    answer: answer,
    category: category,
    image: image
  });
}

async function getQuestionByQuestion(question) {
  return Question.find({question: question});
}

async function getQuestionsByOptionalSearch(search, perPage, page) {
  return Question.find(search ? { question: { $regex: search, $options : 'i' } } : {}).limit(perPage).skip(perPage * (page - 1)).sort({date: -1});
}

async function getQuestionCountBySearch(search) {
  return Question.find(search ? { question: { $regex: search, $options : 'i' } } : {}).sort({date: -1});
}

async function updateQuestionInformationById(id, question, answer, category) {
  return Question.findOneAndUpdate({_id: id}, {
    question: question,
    answer: answer,
    category: category,
    date: Date.now(),
  }, {new: true});
}

async function updateQuestionImageById(id, image) {
  return Question.findOneAndUpdate({_id: id}, {
    image: image,
    date: Date.now(),
  }, {new: true});
}

async function deleteQuestionById(id) {
  return Question.deleteOne({_id: id});
}

async function addAskedQuestion(lobby, roundId, questionId) {
  const quiz = await Quiz.findOne({lobby: lobby}).select('rounds').populate('rounds.askedQuestions.question');
  const round = quiz.rounds.id(roundId);
  const question = await Question.findOne({_id: questionId});
  round.askedQuestions.push({question: question});
  return quiz.save();
}

async function deleteAllQuestions() {
  return Question.deleteMany({});
}

async function getQuestionsCount() {
  return Question.countDocuments();
}

module.exports = {
  getCategoriesFromQuestions,
  getQuestionsByLobby,
  addAskedQuestion,
  deleteAllQuestions,
  getQuestionsCount,
  createQuestion,
  getQuestionByQuestion,
  getQuestionsByOptionalSearch,
  deleteQuestionById,
  getQuestionCountBySearch,
  getQuestionById,
  updateQuestionInformationById,
  updateQuestionImageById
}
