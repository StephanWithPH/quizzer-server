const Quiz = require('../models/quiz');

function createNewQuiz(lobby) {
  // Mongoose create new quiz with model
  const newQuiz = new Quiz({
    lobby: lobby
  });
  return newQuiz.save();
}

function findQuizByLobby(lobby) {
  return Quiz.findOne({lobby: lobby}).populate('teams').populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team');
}

async function endQuiz(lobby){
  return Quiz.findOneAndUpdate({lobby: lobby}, {finished: true});
}

module.exports = {
  createNewQuiz,
  findQuizByLobby,
  endQuiz
}
