const {getCategories, getFilteredCategories, createCategory, deleteCategory, getCategoryById, getCategoryByName,
  updateCategory
} = require("../../queries/categoryQueries");
const {checkIfUserAuthenticatedWithBearerToken, createRoleMiddleware,
  createFindModelByIdMiddleware
} = require("../middleware");
const router = require('express').Router();
const User = require("../../models/user");



/**
 * Apply middleware for 'logged in' routes
 */
router.use(checkIfUserAuthenticatedWithBearerToken());
router.use(createRoleMiddleware('admin'));
router.use(createFindModelByIdMiddleware(User));

/**
 * Gets all the categories from the questions
 */
router.get('/', async (req, res, next) => {
  try {
    const { page, perPage, search } = req.query;
    if (page && perPage) {
      const categories = await getFilteredCategories(page, perPage, search);
      const total = await getCategories();
      return res.status(200).json({
        categories,
        total: total.length
      });
    } else {
      const categories = await getCategories();
      return res.status(200).json(categories);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Gets a category by id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);
    return res.status(200).json(category);
  } catch (err) {
    next(err);
  }
});

/**
 * Updates a category
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the name is not used yet
    const categoryExists = await getCategoryByName(name);
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await updateCategory(id, name);
    return res.status(200).json(category);
  } catch (err) {
    next(err);
  }
});

/**
 * Creates a new category
 */
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Geef a.u.b een naam op' });
    }

    // Check if the category already exists
    const categories = await getCategories();
    const categoryExists = categories.find((category) => category.name === name);

    if (categoryExists) {
      return res.status(400).json({ error: 'Categorie bestaat al' });
    }

    const category = await createCategory(name);

    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
});

/**
 * Deleted a category
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await deleteCategory(id);

    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
