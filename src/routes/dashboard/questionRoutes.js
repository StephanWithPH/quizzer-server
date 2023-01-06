const {
  getQuestionById,
  updateQuestionInformationById,
  updateQuestionImageById,
  getQuestionByQuestion,
  createQuestion,
  deleteQuestionById,
  deleteAllQuestions, getFilteredQuestions
} = require("../../queries/questionQueries");
const {deleteQuestionImage, convertBase64ToImage, deleteFolder} = require("../../helpers/imageHelper");
const router = require('express').Router();

/**
 * Get one question by id
 */
router.get('/questions/:id', async (req, res, next) => {
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
router.get('/questions', async (req, res, next) => {
  try {
    const { search, page, perPage } = req.query;

    const body = await getFilteredQuestions(page, perPage, search);

    res.status(200).json(body);

  } catch (err) {
    next(err);
  }
});

/**
 * Update one question's information by id
 */
router.put('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const updatedQuestion = await updateQuestionInformationById(id, question, answer, category);
    console.log(updatedQuestion);

    if (updatedQuestion) {
      res.status(200).json(updatedQuestion);
    } else {
      res.status(404).json({error: "Vraag niet gevonden"});
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * Update one question's image by id
 */
router.patch('/questions/:id', async (req, res, next) => {
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
router.post('/questions', async (req, res, next) => {
  try {
    const {question, answer, category, base64Image } = req.body;

    // Check if the question doesn't already exist
    const questionExists = await getQuestionByQuestion(question);

    if (questionExists) {
      res.status(409).json({error: "Deze vraag bestaat al"});
      return;
    }

    let imagePath = undefined;

    if (base64Image) {
      imagePath = await convertBase64ToImage(base64Image, "questions");
    }
    const newQuestion = await createQuestion(question, answer, category, imagePath);

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
router.delete('/questions', async (req, res, next) => {
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