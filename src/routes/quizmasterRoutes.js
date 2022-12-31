const {createNewQuiz, endQuiz} = require("../queries/quizQueries");
const {generateLobbyCode} = require("../helpers/lobbyHelper");
const router = require('express').Router();
const Quiz = require('../models/quiz');
const {createRoleMiddleware, createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware,
  checkIfUserAuthenticatedWithBearerToken
} = require("./middleware");
const {updateTeamAcceptedById, deleteTeam, updateTeamsAcceptedInLobby} = require("../queries/teamQueries");
const {broadcastToTeam, broadcastToTeams, broadcastToScoreboard, broadcastToAdmin} = require("../socketserver");
const {getQuestionsByLobby, addAskedQuestion} = require("../queries/questionQueries");
const {addNewRound, getAllRounds, closeAskedQuestion, updateGivenAnswer, finishRound} = require("../queries/roundQueries");
const {calculateAndSavePoints, getCorrectAnswersPerTeam} = require("../helpers/pointsHelper");
const {signJwt} = require("../helpers/jwtHelper");
const {getCategories} = require("../queries/categoryQueries");

/**
 * Create a new quiz
 */
router.post('/quizzes', async (req, res, next) => {
  try {
    let generatedLobbyCode = generateLobbyCode(5);
    let uniqueLobbyCode = false;

    // Check if unique in database, else generate new lobby code
    while (!uniqueLobbyCode) {
      const count = await Quiz.countDocuments({lobby: generatedLobbyCode});
      if (count === 0) {
        uniqueLobbyCode = true;
      } else {
        generatedLobbyCode = generateLobbyCode(5);
      }
    }

    // Insert new quiz into database
    createNewQuiz(generatedLobbyCode).then(async (quiz) => {
      const resQuiz = quiz.toObject();
      resQuiz.token = await signJwt({
        role: 'qm',
        lobby: generatedLobbyCode
      });
      res.status(201).json(resQuiz);
    });
  }
  catch (e) {
    next(e);
  }
});


/**
 * Apply middleware for 'logged in' routes
 */
router.use(checkIfUserAuthenticatedWithBearerToken());
router.use(createRoleMiddleware('qm'));
router.use(createFindQuizByLobbyCodeMiddleware());
router.use(createQuizExistsMiddleware());


/**
 * Get teams for a specific quiz
 */
router.get('/quizzes/:lobby/teams', (req, res, next) => {
  try {
    res.status(200).json(req.quiz.teams);
  }
  catch (e) {
    next(e)
  }
});

/**
 * Accept all teams
 */
router.patch('/quizzes/:lobby/teams', async (req, res, next) => {
  try {
    const teams = await updateTeamsAcceptedInLobby(req.session.lobby);

    // Send websocket event somewhere here to notify the team that they have been accepted
    teams.forEach(team => {
      broadcastToTeam("TEAM_ACCEPTED", req.session.lobby, team._id.toString());
    });
    broadcastToScoreboard('TEAM_ACCEPTED', req.session.lobby);
    broadcastToAdmin("NEW_TEAM");

    res.status(200).json(teams);
  }
  catch (e) {
    next(e)
  }
});

/**
 * Accept a team
 */
router.patch('/quizzes/:lobby/teams/:teamId', async (req, res, next) => {
  try {
    const team = await updateTeamAcceptedById(req.params.teamId, req.body.accepted);

    // Send websocket event somewhere here to notify the team that they have been accepted
    broadcastToTeam("TEAM_ACCEPTED", req.session.lobby, req.params.teamId);
    broadcastToScoreboard('TEAM_ACCEPTED', req.session.lobby);
    broadcastToAdmin("NEW_TEAM");

    res.status(200).json(team);
  }
  catch (e) {
    next(e)
  }
});

/**
 * Reject a team
 */
router.delete('/quizzes/:lobby/teams/:teamId', async (req, res, next) => {
  try {
    await deleteTeam(req.params.teamId);

    // Send websocket event somewhere here to notify the team that they have been declined
    broadcastToTeam("TEAM_DECLINED", req.session.lobby, req.params.teamId, true);

    res.status(200).json({
      message: "Team deleted"
    });
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get categories
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.status(200).json(categories);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Add new round
 */
router.post('/quizzes/:lobby/rounds/', async (req, res, next) => {
  try {
    const newRound = await addNewRound(req.session.lobby, req.body.chosenCategories);
    await broadcastToScoreboard("NEW_ROUND", req.session.lobby);
    res.status(200).json(newRound);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get all rounds
 */
router.get('/quizzes/:lobby/rounds', async (req, res, next) => {
  try {
    const rounds = await getAllRounds(req.session.lobby);
    res.status(200).json(rounds.rounds);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Get all questions
 */
router.get('/quizzes/:lobby/questions', async (req, res, next) => {
  try {
    const questions = await getQuestionsByLobby(req.session.lobby);
    res.status(200).json(questions);
  }
  catch (e) {
    next(e);
  }
});

/**
 * Add asked question to round
 */
router.post('/quizzes/:lobby/rounds/:roundId/askedquestions', async (req, res, next) => {
  try {
    await addAskedQuestion(req.session.lobby, req.params.roundId, req.body.question);

    // Send websocket event somewhere here to notify the teams that a new question has been asked
    await broadcastToTeams("NEW_QUESTION", req.session.lobby);
    await broadcastToScoreboard("NEW_QUESTION", req.session.lobby);

    res.status(201).json({
      message: "Question added to round"
    });
  }
  catch (e) {
    next(e);
  }
});

/**
 * Close asked question
 */
router.patch('/quizzes/:lobby/rounds/:roundId/askedquestions/:askedQuestionId', async (req, res, next) => {
  try {
    await closeAskedQuestion(req.session.lobby, req.params.roundId, req.params.askedQuestionId);
    await broadcastToTeams("QUESTION_CLOSED", req.session.lobby);
    await broadcastToScoreboard("QUESTION_CLOSED", req.session.lobby);
    res.status(200).json({
      message: "Question closed"
    });
  }
  catch (e) {
    next(e);
  }
});

/**
 * Approve given answer from team
 */
router.patch('/quizzes/:lobby/rounds/:roundId/askedquestions/:askedQuestionId/givenanswers/:givenAnswerId', async (req, res, next) => {
  try {
    const {isCorrect} = req.body;
    if(isCorrect === undefined) {
      const error = new Error("Waarde isCorrect niet meegegeven")
      error.status = 400;
      throw error;
    }
    await updateGivenAnswer(req.session.lobby, req.params.roundId, req.params.askedQuestionId, req.params.givenAnswerId, isCorrect);
    await broadcastToScoreboard("QUESTION_APPROVED", req.session.lobby);
    res.status(200).json({
      message: `Antwoord is ${isCorrect ? "goedgekeurd" : "afgekeurd"}`
    });
  }
  catch (e) {
    next(e);
  }
});

/**
 * Finish the round
 */
router.patch(`/quizzes/:lobby/rounds/:roundId`, async (req, res, next) => {
  try{
    let correctAnswersPerTeam = getCorrectAnswersPerTeam(req.quiz, req.params.roundId);
    await calculateAndSavePoints(correctAnswersPerTeam);
    await finishRound(req.session.lobby, req.params.roundId);
    await broadcastToTeams("ROUND_FINISHED", req.session.lobby);
    await broadcastToScoreboard("ROUND_FINISHED", req.session.lobby)
    res.status(200).json({
      message: "Round finished"
    });
  }catch (e){
    next(e);
  }
});

/**
 * End the quiz
 */
router.patch(`/quizzes/:lobby`, async (req, res, next) => {
  try{
    await endQuiz(req.session.lobby);
    await broadcastToTeams("QUIZ_ENDED", req.session.lobby);
    await broadcastToScoreboard("QUIZ_ENDED", req.session.lobby);
    res.status(200).json({
      message: "Quiz ended"
    });
  }catch (e){
    next(e);
  }
});

module.exports = router;
