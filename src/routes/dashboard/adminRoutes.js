const router = require('express').Router();
const {signJwt, verifyJwt} = require("../../helpers/jwtHelper");
const { getQuestionsCount, getCategoriesFromQuestions } = require("../../queries/questionQueries");
const {getQuizzesCount} = require("../../queries/quizQueries");
const {countImages} = require("../../helpers/imageHelper");

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

module.exports = router;