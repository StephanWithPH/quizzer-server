const router = require('express').Router();
const {createRoleMiddleware, createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware,
  checkIfUserAuthenticatedWithBearerToken
} = require("./middleware");
const Quiz = require("../models/quiz");
const {broadcastToQuizmaster} = require("../socketserver");
const {getAllRounds} = require("../queries/roundQueries");
const {getPodiumTeams} = require("../helpers/pointsHelper");
const {getCorrectAnswersPerTeam} = require("../helpers/pointsHelper");
const {signJwt} = require("../helpers/jwtHelper");

/**
 * Connect a new scoreboard to the provided quiz
 */
router.post('/quizzes/:lobby/scoreboards', async (req, res, next) => {
  try {
    const { lobby } = req.params;

    let quiz = await Quiz.findOne({lobby: lobby, finished: false});

    // If no active quiz is found send back error
    if (quiz === null) {
      let error = new Error("Quiz niet gevonden");
      error.status = 404;
      throw error;
    }

    // Let the quizmaster know the scoreboard has been connected
    broadcastToQuizmaster("SCOREBOARD_CONNECTED", lobby);

    const token = await signJwt({
      role: 'sb',
      lobby: lobby
    }) ;

    res.status(200).json({token});
  }
  catch (e) {
    next(e);
  }
});

/**
 * Apply middleware for 'logged in' routes
 */
router.use(checkIfUserAuthenticatedWithBearerToken());
router.use(createRoleMiddleware('sb'));
router.use(createFindQuizByLobbyCodeMiddleware());
router.use(createQuizExistsMiddleware());

/**
 * Get teams for scoreboard
 */
router.get('/quizzes/:lobby/teams', async (req, res, next) => {
  try {
    let teams = [];

    if(req.query.categorize === 'top3') {
      teams = getPodiumTeams(req.quiz.teams);
    }
    else {
      teams = req.quiz.teams.filter((team) => team.accepted);
    }
    res.status(200).json(teams);
  } catch (e) {
    next(e);
  }
});

/**
 * Get all rounds for scoreboard
 */
router.get('/quizzes/:lobby/rounds', async (req, res, next) => {
  try {
    const rounds = await getAllRounds(req.session.lobby);
    res.status(200).json(rounds.rounds);
  } catch (e) {
    next(e);
  }
});

/**
 * Get correct answers for all teams
 */
router.get('/quizzes/:lobby/rounds/:roundId/askedquestions', async (req, res, next) => {
  try{
    const { roundId } = req.params;
    const correctAnswersPerTeam = getCorrectAnswersPerTeam(req.quiz, roundId);
    res.status(200).json(correctAnswersPerTeam);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
