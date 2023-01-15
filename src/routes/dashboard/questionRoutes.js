const {
  getQuestionById,
  getQuestionsByOptionalSearch,
  getQuestionCountBySearch,
  updateQuestionInformationById,
  updateQuestionImageById,
  getQuestionByQuestion,
  createQuestion,
  deleteQuestionById,
  deleteAllQuestions
} = require("../../queries/questionQueries");
const {deleteQuestionImage, convertBase64ToImage, deleteFolder} = require("../../helpers/imageHelper");
const {getCategoryByName} = require("../../queries/categoryQueries");
const {createImageTypeMiddleware, checkIfUserAuthenticatedWithBearerToken, createRoleMiddleware,
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
 * Get one question by id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await getQuestionById(id);

    if (question) {
      res.status(200).json(question);
    } else {
      res.status(404).json({error: "Question not found"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Get questions by page and/or search the questions
 */
router.get('/', async (req, res, next) => {
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
 * Update one question's information by id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const selectedCategory = await getCategoryByName(category);

    const updatedQuestion = await updateQuestionInformationById(id, question, answer, selectedCategory._id);

    if (updatedQuestion) {
      res.status(200).json(updatedQuestion);
    } else {
      res.status(404).json({error: "Vraag niet gevonden"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Update one question's image by id
 */
router.patch('/:id', createImageTypeMiddleware(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { base64Image } = req.body;

    let imagePath = '';

    const question = await getQuestionById(id);

    if (question.image) {
      const imageName = question.image.split("/").pop();
      await deleteQuestionImage(imageName);
    }

    if (base64Image) {
      imagePath = await convertBase64ToImage(base64Image, "questions");
    }

    await updateQuestionImageById(id, imagePath);

    if (question) {
      res.status(200).json({ message: "Vraag bijgewerkt" });
    } else {
      res.status(404).json({error: "Vraag niet gevonden"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new question
 */
router.post('/', createImageTypeMiddleware(), async (req, res, next) => {
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

    const selectedCategory = await getCategoryByName(category);

    const newQuestion = await createQuestion(question, answer, selectedCategory._id, imagePath);
    res.status(200).json(newQuestion);
  } catch (err) {
    next(err);
  }
});

/**
 * Delete one question
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await getQuestionById(id);

    if (question.image) {
      const imageName = question.image.split("/").pop();
      await deleteQuestionImage(imageName);
    }
    await deleteQuestionById(id);

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
router.delete('/', async (req, res, next) => {
  try {
    await deleteAllQuestions();
    await deleteFolder('questions');

    res.status(204).json({
      message: "Alle vragen zijn verwijderd"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
