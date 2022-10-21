const router = require('express').Router();
const Quiz = require('../models/quiz');
const {createNewTeam} = require("../queries/teamQueries");
const {broadcastToQuizmaster, broadcastToScoreboard} = require("../socketserver");
const {
    createRoleMiddleware, createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware,
    createTeamAcceptedMiddleware, createFindTeamByIdMiddleware,
    createTeamExistsMiddleware, createTeamNameLengthMiddleware, createAnswerQuestionLengthMiddleware,
    createTeamNameExistsMiddleware, createAnswerExistsMiddleware
} = require("./middleware");
const {getAllRoundsWithoutAnswers, addGivenAnswerToAskedQuestion} = require("../queries/roundQueries");
const base64ImageToFile = require('base64image-to-file');
const Path = require("path");

/**
 * Join with a team
 */
router.post('/quizzes/:lobby/teams', createTeamNameExistsMiddleware(), createTeamNameLengthMiddleware(), async (req, res, next) => {
    try {
        const {name, image} = req.body;
        const {lobby} = req.params;

        // Get lobby by lobbycode
        let quiz = await Quiz.findOne({lobby: lobby, finished: false}).populate('teams');

        // If no active quiz is found send back error
        if (quiz === null) {
            let error = new Error("Quiz niet gevonden");
            error.status = 404;
            throw error;
        }

        if(quiz.rounds.length > 0) {
            const error = new Error("Quiz is al gestart");
            error.status = 403;
            throw error;
        }

        let teamWithNameExists = await quiz.teams.find(team => team.name === name);

        if (teamWithNameExists) {
            let error = new Error("Team met deze naam bestaat al");
            error.status = 404;
            throw error;
        }

        // Check if there is an image, if yes then save it and retrieve the path
        let imagePath = undefined;
        if(image && image.length > 0) {
            const path ='./static/images/teams';
            imagePath = await new Promise((resolve, reject) => {
                base64ImageToFile(image, path, function(err, imgPath) {
                    if(err) {
                        const error = new Error("Fout met uploaden van de afbeelding");
                        error.status = 500;
                        reject(error);
                    }
                    resolve(imgPath.slice(1));
                });
            });
        }

        // Create new team and push it to the quiz
        const newTeam = await createNewTeam(name, imagePath);

        quiz.teams.push(newTeam);
        quiz.save();

        // Set session credentials for this new team, so we can identify it in later requests
        req.session._id = newTeam._id;
        req.session.role = 'team';
        req.session.lobby = lobby;


        // Send websocket event somewhere here to let the quizmaster retrieve all teams again because a new entry is made
        broadcastToQuizmaster('TEAM_JOINED', req.session.lobby);

        return res.status(201).json(newTeam);
    }
    catch (e) {
        next(e);
    }
});

/**
 * Apply middleware for 'logged in' routes
 */
router.use(createRoleMiddleware('team'));
router.use(createFindQuizByLobbyCodeMiddleware());
router.use(createFindTeamByIdMiddleware());
router.use(createTeamExistsMiddleware());
router.use(createTeamAcceptedMiddleware());
router.use(createQuizExistsMiddleware());

/**
 * Get current quiz rounds state
 */
router.get('/quizzes/:lobby/rounds', async (req, res, next) => {
    try {
        const rounds = await getAllRoundsWithoutAnswers(req.session.lobby);
        return res.status(200).json(rounds.rounds);
    }
    catch (e) {
        next(e);
    }
});

/**
 * Answer an asked question
 */
router.post('/quizzes/:lobby/rounds/:roundId/askedQuestions/:askedQuestionId/givenAnswers', createAnswerExistsMiddleware(), createAnswerQuestionLengthMiddleware(), async (req, res, next) => {
    try {
        const {answer} = req.body;
        const {lobby, roundId, askedQuestionId} = req.params;

        await addGivenAnswerToAskedQuestion(lobby, roundId, askedQuestionId, req.team, answer);

        broadcastToQuizmaster('TEAM_ANSWERED', req.session.lobby);
        broadcastToScoreboard('TEAM_ANSWERED', req.session.lobby)
        return res.status(201).json({
            message: "Antwoord is opgeslagen",
        });
    }
    catch (e) {
        next(e);
    }
});

/**
 * Get team information
 */
router.get('/quizzes/:lobby/teams/:teamId', async (req, res, next) => {
    try {
        return res.status(200).json(req.team);
    }
    catch (e) {
        next(e);
    }
});

module.exports = router;
