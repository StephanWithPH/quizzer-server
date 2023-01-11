const {getFilteredQuizzes, getQuizCountBySearch} = require("../../queries/quizQueries");
const router = require('express').Router();

/**
 * Gets all the quizzes
 */
router.get('/quizzes', async (req, res, next) => {
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