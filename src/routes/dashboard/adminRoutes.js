const router = require('express').Router();
const {signJwt} = require("../../helpers/jwtHelper");
const { getQuestionsCount } = require("../../queries/questionQueries");
const {getQuizzesCount} = require("../../queries/quizQueries");
const {countImages} = require("../../helpers/imageHelper");
const {getCategories} = require("../../queries/categoryQueries");
const {getTeamImagesCount} = require("../../queries/teamQueries");
const {checkIfUserAuthenticatedWithBearerToken, createRoleMiddleware,
  createFindModelByIdMiddleware
} = require("../middleware");
const {findUserByUserName} = require("../../queries/userQueries");
const User = require("../../models/user");

/**
 * Admin Login
 */
router.post('/login', async (req, res, next) => {
  try {
    const {userName, password} = req.body;
    if(!userName || !password) {
      let error = new Error("Niet alle velden zijn correct meegegeven");
      error.status = 400;
      throw error;
    }

    const user = await findUserByUserName(userName);

    if(!user || !await user.comparePassword(password)) {
      let error = new Error("Gebruikersnaam en/of wachtwoord onjuist");
      error.status = 401;
      throw error;
    }

    const token = await signJwt({
      role: 'admin',
      _id: user._id
    });

    res.status(200).json({token});
  } catch (err) {
    next(err);
  }
});

/**
 * Apply middleware for 'logged in' routes
 */
router.use(checkIfUserAuthenticatedWithBearerToken());
router.use(createRoleMiddleware('admin'));
router.use(createFindModelByIdMiddleware(User))

/**
 * Gets the counts of questions, categories, quizzes and team images
 */
router.get('/totals', async (req, res, next) => {
  try {
    const questions = await getQuestionsCount();
    const quizzes = await getQuizzesCount();
    const categories = await getCategories();
    const images = await getTeamImagesCount();
    const placeholders = await countImages('teamplaceholders');

    const responseObj = {
      questions,
      quizzes,
      categories: categories.length,
      images,
      placeholders,
    }

    res.status(200).json(responseObj);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
