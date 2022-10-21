const Quiz = require('../models/quiz');

async function addNewRound(lobby, chosenCategories) {
    const quiz = await Quiz.findOneAndUpdate({lobby: lobby}, {
        $push: {
            rounds: {
                chosenCategories
            }
        }
    }, {new: true});

    return quiz.rounds[quiz.rounds.length - 1];
}

function getAllRounds(lobby) {
    return Quiz.findOne({lobby: lobby}).populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team').select('rounds');
}

function getAllRoundsWithoutAnswers(lobby) {
    return Quiz.findOne({lobby: lobby}).populate('rounds.askedQuestions.question', '-answer').select('-rounds.askedQuestions.givenAnswers');
}

function closeAskedQuestion(lobby, roundId, askedQuestionId) {
    return Quiz.findOneAndUpdate({lobby: lobby, 'rounds.askedQuestions._id': askedQuestionId}, {
        $set: {
            'rounds.$[element1].askedQuestions.$[element2].closed': true
        }
    }, {arrayFilters: [{'element1._id': roundId}, {'element2._id': askedQuestionId}], new: true});
}

async function addGivenAnswerToAskedQuestion(lobby, roundId, askedQuestionId, team, answer) {
    let quiz = await Quiz.findOne({lobby: lobby}).populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team');
    let round = quiz.rounds.id(roundId);
    let askedQuestion = round.askedQuestions.id(askedQuestionId);
    if(askedQuestion.closed) {
        throw new Error("Deze vraag is al gesloten.");
    }
    // Insert or update given answer
    let givenAnswer = askedQuestion.givenAnswers.find(givenAnswer => {
        return givenAnswer.team._id.toString() === team._id.toString();
    });
    if (givenAnswer) {
        givenAnswer.answer = answer;
    }
    else {
        askedQuestion.givenAnswers.push({team, answer});
    }
    return quiz.save();
}

async function updateGivenAnswer(lobby, roundId, askedQuestionId, givenAnswerId, isCorrect) {
    let quiz = await Quiz.findOne({lobby: lobby}).populate('rounds.askedQuestions.question').populate('rounds.askedQuestions.givenAnswers.team');
    let round = quiz.rounds.id(roundId);
    let askedQuestion = round.askedQuestions.id(askedQuestionId);
    let givenAnswer = askedQuestion.givenAnswers.id(givenAnswerId);
    givenAnswer.isCorrect = isCorrect;
    return quiz.save();
}

async function finishRound(lobby, roundId){
    return Quiz.findOneAndUpdate({lobby: lobby, 'rounds._id': roundId}, {
        $set: {
            'rounds.$[element1].finished': true
        }
    }, {arrayFilters: [{'element1._id': roundId}], new: true});
}

module.exports = {
    addNewRound,
    getAllRounds,
    getAllRoundsWithoutAnswers,
    closeAskedQuestion,
    addGivenAnswerToAskedQuestion,
    updateGivenAnswer,
    finishRound
}
