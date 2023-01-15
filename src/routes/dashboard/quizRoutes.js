const {getFilteredQuizzes, getQuizCountBySearch} = require("../../queries/quizQueries");
const {checkIfUserAuthenticatedWithBearerToken, createRoleMiddleware,
  createFindModelByIdMiddleware
} = require("../middleware");
const User = require("../../models/user");
const router = require('express').Router();

/**
 * Apply middleware for 'logged in' routes
 */
router.use(checkIfUserAuthenticatedWithBearerToken());
router.use(createRoleMiddleware('admin'));
router.use(createFindModelByIdMiddleware(User));

/**
 * Gets all the quizzes
 */
router.get('/', async (req, res, next) => {
  try {
    const {page, perPage, search} = req.query;

    const quizzes = await getFilteredQuizzes(page, perPage, search);
    const total = await getQuizCountBySearch(search);

    res.status(200).json({
      quizzes,
      total: total.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
