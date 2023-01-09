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
const {broadcastToAdmin} = require("../../socketserver");
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
router.put('/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const updatedQuestion = await updateQuestionInformationById(id, question, answer, category);

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

    const question = await getQuestionById(id);

    if (question.image) {
      const imageName = question.image.split("/").pop();
      await deleteQuestionImage(imageName);
    }
    await deleteQuestionById(id);

    broadcastToAdmin("QUESTION_DELETED");
    res.status(204).json({
      message: "Vraag verwijderd",
    });
  } catch (err) {
    console.log(err);
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

    broadcastToAdmin("QUESTIONS_DELETED");
    res.status(204).json({
      message: "Alle vragen zijn verwijderd"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;