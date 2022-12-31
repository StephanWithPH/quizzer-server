const {getCategories} = require("../../queries/categoryQueries");
const router = require('express').Router();

/**
 * Gets all the categories from the questions
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getCategories();

    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;