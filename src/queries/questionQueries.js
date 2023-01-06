const Question = require('../models/question');
const Category = require('../models/category');
const Quiz = require('../models/quiz');

async function getQuestionById(id) {
  const categories = await Category.find();
  const questions = categories.map(category => category.questions.map((question) => ({
    ...question,
    category: category.name
  }))).flat();
  return questions.find(question => question._id.toString() === id);
}

async function getQuestionsByLobby(lobby) {
  const quiz = await Quiz.findOne({lobby: lobby}).select('rounds').populate('rounds.askedQuestions.question');
  const round = quiz.rounds[quiz.rounds.length - 1];
  const roundCategories = round.chosenCategories;
  const allAskedQuestions = quiz.rounds.map(round => round.askedQuestions);
  const mergedAskedQuestions = [].concat.apply([], allAskedQuestions);
  let questions = await Question.find({
    $and: [{
      // Find questions that haven't been asked yet
      _id: {$nin: mergedAskedQuestions.map(askedQuestion => askedQuestion.question._id)}
    }, {
      // Find questions that are in one of the chosen categories
      category: {$in: roundCategories}
    }]
  }).populate('category');

  // If all questions are already asked then return just all of them as a fallback
  if (questions.length === 0) {
    questions = await Question.find({category: {$in: roundCategories}});
  }

  return questions;
}

async function createQuestion(question, answer, category, image) {
  return Category.findOneAndUpdate({name: category}, {
    $push: {
      questions: {
        question: question,
        answer: answer,
        image: image,
      }
    }
  }, {new: true});
}

async function getQuestionByQuestion(question) {
  const categories = await Category.find();
  const questions = categories.map(category => category.questions.map((question) => ({
    ...question,
    category: category.name
  }))).flat();
  return questions.find(q => q.question.toLowerCase() === question.toLowerCase());
}

async function getQuestionsCount() {
  let count = 0;
  const categories = await Category.find({});
  categories.forEach(category => count += category.questions.length);
  return count;
}

async function updateQuestionInformationById(id, question, answer, category) {
  // If the category is the same then just update the embedded question and answer in the category
  const oldQuestion = await getQuestionById(id);
  if (oldQuestion.category === category) {
    // Update the question and answer in the category
    return Category.findOneAndUpdate({name: category, 'questions._id': id}, {
      $set: {
        'questions.$.question': question,
        'questions.$.answer': answer,
        'questions.$.date': Date.now(),
      },
    }, {new: true});
  } else {
    // If the category is different, remove the question from the old category and add it to the new one
    await Category.findOneAndUpdate({name: oldQuestion.category}, {
      $pull: {
        questions: {_id: id}
      }
    });
    await Category.findOneAndUpdate({name: category}, {
      $push: {
        questions: {
          question: question,
          answer: answer,
          image: oldQuestion.image,
          date: Date.now,
        }
      }
    }, {new: true});
  }
}

async function updateQuestionImageById(id, image) {
  return Question.findOneAndUpdate({_id: id}, {
    image: image,
    date: Date.now(),
  }, {new: true});
}

async function deleteQuestionById(id) {
  const categories = await Category.find();
  const questions = categories.map(category => category.questions.map((question) => ({
    ...question,
    category: category.name
  }))).flat();
  const question = questions.find(question => question._id.toString() === id);
  const category = await Category.findOne({name: question.category});
  // Filter out the question that needs to be deleted
  category.questions = category.questions.filter(question => question._id.toString() !== id);
  return category.save();
}

async function addAskedQuestion(lobby, roundId, questionId) {
  const quiz = await Quiz.findOne({lobby: lobby}).select('rounds').populate('rounds.askedQuestions.question');
  const round = quiz.rounds.id(roundId);
  const question = await Question.findOne({_id: questionId});
  round.askedQuestions.push({question: question});
  return quiz.save();
}

async function deleteAllQuestions() {
  return Category.updateMany({}, {$set: {questions: []}}, {new: true});
}

async function getFilteredQuestions(page = 1, perPage = 10, search) {
  const categories = await Category.find();

  // Add the category to the question object and select the given per page amount of questions, and sort them by date
  let questions = categories.map(category => category.questions.map((question) => ({
    ...question,
    category: category.name
  })))
    .flat()
    .sort((a, b) => b.date - a.date);

  if (search) {
    // Filter out the questions that don't match the search query
    questions = questions.filter(question => question.question.toLowerCase().includes(search.toLowerCase()));
  }


  return {
    questions: questions.slice(perPage * (page - 1), perPage * page),
    total: questions.length
  }
}

module.exports = {
  getQuestionsByLobby,
  addAskedQuestion,
  deleteAllQuestions,
  getQuestionsCount,
  createQuestion,
  getQuestionByQuestion,
  deleteQuestionById,
  getQuestionById,
  updateQuestionInformationById,
  updateQuestionImageById,
  getFilteredQuestions
}
