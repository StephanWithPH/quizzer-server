const Quiz = require('../models/quiz');

function createNewQuiz(lobby) {
  // Mongoose create new quiz with model
  const newQuiz = new Quiz({
    lobby: lobby,
    date: Date.now()
  });
  return newQuiz.save();
}

function getFilteredQuizzes(page, perPage, search) {
  return Quiz.find(search ? {lobby: {$regex: search, $options: 'i'}}: {}).limit(perPage).skip(perPage * (page - 1)).sort({date: -1}).populate('teams').populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team');
}

function getQuizCountBySearch(search) {
  return  Quiz.find(search ? {lobby: {$regex: search, $options: 'i'}}: {}).sort({date: -1});
}

function findQuizByLobby(lobby) {
  return Quiz.findOne({lobby: lobby}).populate('teams').populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team');
}

async function endQuiz(lobby){
  return Quiz.findOneAndUpdate({lobby: lobby}, {finished: true});
}

async function getQuizzesCount(){
  return Quiz.countDocuments();
}

module.exports = {
  createNewQuiz,
  findQuizByLobby,
  getQuizCountBySearch,
  endQuiz,
  getQuizzesCount,
  getFilteredQuizzes
}
