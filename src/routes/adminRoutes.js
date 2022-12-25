const router = require('express').Router();
const {signJwt, verifyJwt} = require("../helpers/jwtHelper");
const {
  deleteAllQuestions, getQuestionsCount, getCategoriesFromQuestions,
  createQuestion, getQuestionByQuestion, deleteQuestionById,
  getQuestionsByOptionalSearch, getQuestionCountBySearch
} = require("../queries/questionQueries");
const {getQuizzesCount} = require("../queries/quizQueries");
const fs = require("fs");
const {convertBase64ToImage, countImages} = require("../helpers/imageHelper");
const {broadcastToQuizmaster, broadcastToAdmin} = require("../socketserver");

/**
 * Admin Login
 */
router.post('/login', async (req, res, next) => {
  try {
    const {password} = req.body;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (password === envPassword) {
      const token = await signJwt({
        role: 'admin',
      });
      res.status(200).json({token});
    } else {
      res.status(401).json({error: "Incorrect wachtwoord"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Admin Token Validation
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (await verifyJwt(token)) {
      res.status(200).json("Token is valide");
    } else {
      res.status(401).json({error: "Token is niet geldig"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Gets the counts of questions, categories, quizzes and team images
 */
router.get('/totals', async (req, res, next) => {
  try {
    const questions = await getQuestionsCount();
    const quizzes = await getQuizzesCount();
    const categories = await getCategoriesFromQuestions();
    const images = await countImages('./static/images/teams');

    const responseObj = {
      questions: questions,
      quizzes: quizzes,
      categories: categories.length,
      images: images,
    }

    res.status(200).json(responseObj);
  } catch (err) {
    next(err);
  }
});

/**
 * Get questions by page and/or search the questions
 */
router.get('/questions', async (req, res, next) => {
  try {
    const { search, page, perPage } = req.query;

    const questions = await getQuestionsByOptionalSearch(search, perPage, page);
    const total = await getQuestionCountBySearch(search);
    res.status(200).json({
      questions,
      total: total.length,
    });

  } catch (err) {
    next(err);
  }
});

/**
 * Create a new question
 */
router.post('/questions', async (req, res, next) => {
  try {
    const {question, answer, category, base64Image } = req.body;

    // Check if the question doesn't already exist
    const questionExists = await getQuestionByQuestion(question);
    if (questionExists.length > 0) {
      res.status(409).json({error: "Deze vraag bestaat al"});
      return;
    }

    let imagePath = undefined;

    if (base64Image) {
      imagePath = await convertBase64ToImage(base64Image, "questions");
    }

    const newQuestion = await createQuestion(question, answer, category, imagePath);
    broadcastToAdmin("QUESTION_CREATED");
    res.status(200).json(newQuestion);
  } catch (err) {
    next(err);
  }
});

/**
 * Delete one question
 */
router.delete('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteQuestionById(id);
    broadcastToAdmin("QUESTION_DELETED");
    res.status(204).json({
      message: "Vraag verwijderd",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Delete all questions
 */
router.delete('/questions', async (req, res, next) => {
  try {
    await deleteAllQuestions();

    broadcastToAdmin("QUESTIONS_DELETED");
    res.status(204).json({
      message: "Alle vragen zijn verwijderd"
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Gets all the categories from the questions
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getCategoriesFromQuestions();

    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;