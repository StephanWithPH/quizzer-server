const {getFilteredQuizzes, getQuizCountBySearch, findQuizById} = require("../../queries/quizQueries");
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

/**
 * Gets a single quiz by id
 */
router.get('/quizzes/:id', async (req, res, next) => {
  try {
    const {id} = req.params;

    const quiz = await findQuizById(id);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found',
      });
    }

    res.status(200).json(quiz);
  } catch (err) {
    next(err);
  }
});

module.exports = router;