import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { NextFunction, Request, Response } from 'express';
import { Role } from '../enums/role';
import { deleteTeam, updateTeamAcceptedById, updateTeamsAcceptedInLobby } from '../queries/teamQueries';
import { endQuiz } from '../queries/quizQueries';
import { addAskedQuestion, getCategoriesFromQuestions, getQuestionsByLobby } from '../queries/questionQueries';
import { addNewRound, closeAskedQuestion, finishRound, updateGivenAnswer } from '../queries/roundQueries';
import { createBearerMiddleware, createRoleMiddleware } from '../middleware/authenticationMiddleware';
import { createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware } from '../middleware/quizMiddleware';
import { calculateAndSavePoints, getCorrectAnswersPerTeam } from '../helpers/pointsHelper';
import { broadcastToTeams, emitToScoreboard, emitToTeam } from '../socket.io';
import { WebsocketEvents } from '../enums/websocket';

@Controller(
    '/quizMaster',
    createBearerMiddleware(),
    createRoleMiddleware(Role.QUIZ_MASTER),
    createFindQuizByLobbyCodeMiddleware(),
    createQuizExistsMiddleware()
)
class QuizMasterController {
    /**
     * Get teams for a specific quiz
     */
    @Route('get', '/quiz/:lobby/teams')
    async getTeams(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json(req.quiz?.teams);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Accept all teams
     */
    @Route('patch', '/quiz/:lobby/teams')
    async acceptAllTeams(req: Request, res: Response, next: NextFunction) {
        try {
            const teams = await updateTeamsAcceptedInLobby(req.session.lobby);

            broadcastToTeams(WebsocketEvents.TEAM_ACCEPTED, req.session.lobby);
            emitToScoreboard(WebsocketEvents.TEAM_ACCEPTED, req.session.lobby);

            res.status(200).json(teams);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Accept a team
     */
    @Route('patch', '/quiz/:lobby/teams/:teamId')
    async acceptTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const team = await updateTeamAcceptedById(req.params.teamId);

            // Send websocket event somewhere here to notify the team that they have been accepted
            emitToTeam(WebsocketEvents.TEAM_ACCEPTED, req.session.lobby, req.params.teamId);
            emitToScoreboard(WebsocketEvents.TEAM_ACCEPTED, req.session.lobby);
            res.status(200).json(team);
        } catch (e) {
            next(e);
        }
    }

    /**
     * decline a team
     */
    @Route('delete', '/quiz/:lobby/teams/:teamId')
    async declineTeam(req: Request, res: Response, next: NextFunction) {
        try {
            await deleteTeam(req.params.teamId);

            emitToTeam(WebsocketEvents.TEAM_DECLINED, req.session.lobby, req.params.teamId, true);

            res.status(200).json({ message: 'deleted' });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get categories
     */
    @Route('get', '/quiz/categories')
    async getCategories(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await getCategoriesFromQuestions();
            res.status(200).json(categories);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Add new round
     */
    @Route('post', '/quiz/:lobby/rounds')
    async addNewRound(req: Request, res: Response, next: NextFunction) {
        try {
            const newRound = await addNewRound(req.session.lobby, req.body.chosenCategories);
            emitToScoreboard(WebsocketEvents.NEW_QUESTION, req.session.lobby);
            res.status(200).json(newRound);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get all rounds
     */
    @Route('get', '/quiz/:lobby/rounds')
    async getAllRounds(req: Request, res: Response, next: NextFunction) {
        try {
            // const rounds = await getAllRounds(req.session.lobby!);
            // res.status(200).json(rounds?.rounds);
            res.status(200).json(req.quiz?.rounds);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get all questions
     */
    @Route('get', '/quiz/:lobby/questions')
    async getAllQuestions(req: Request, res: Response, next: NextFunction) {
        try {
            const questions = await getQuestionsByLobby(req.session.lobby!);
            res.status(200).json(questions);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Add asked question to round
     */
    @Route('post', '/quiz/:lobby/rounds/:roundId/askedQuestions')
    async addAskedQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            await addAskedQuestion(req.session.lobby, req.params.roundId, req.body.question);

            // Send websocket event somewhere here to notify the teams that a new question has been asked
            broadcastToTeams(WebsocketEvents.NEW_QUESTION, req.session.lobby);
            emitToScoreboard(WebsocketEvents.NEW_QUESTION, req.session.lobby);

            res.status(201).json({
                message: 'Question added to round'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Close asked question
     */
    @Route('patch', '/quiz/:lobby/rounds/:roundId/askedQuestions/:askedQuestionId')
    async closeAskedQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            await closeAskedQuestion(req.session.lobby, req.params.roundId, req.params.askedQuestionId);

            broadcastToTeams(WebsocketEvents.QUESTION_CLOSED, req.session.lobby);
            emitToScoreboard(WebsocketEvents.QUESTION_CLOSED, req.session.lobby);
            res.status(200).json({
                message: 'Question closed'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Approve given answer from team
     */
    @Route('patch', '/quiz/:lobby/rounds/:roundId/askedQuestions/:askedQuestionId/givenAnswers/:givenAnswerId')
    async approveGivenAnswer(req: Request, res: Response, next: NextFunction) {
        try {
            const { isCorrect } = req.body;
            if (isCorrect === undefined) {
                const error = new Error('Waarde isCorrect niet meegegeven');
                res.status(400);
                return next(error);
            }
            await updateGivenAnswer(req.session.lobby, req.params.roundId, req.params.askedQuestionId, req.params.givenAnswerId, isCorrect);

            emitToScoreboard(WebsocketEvents.QUESTION_APPROVED, req.session.lobby);
            res.status(200).json({
                message: `Antwoord is ${isCorrect ? 'goedgekeurd' : 'afgekeurd'}`
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Finish the round
     */
    @Route('patch', '/quiz/:lobby/rounds/:roundId')
    async finishRound(req: Request, res: Response, next: NextFunction) {
        try {
            const correctAnswersPerTeam = getCorrectAnswersPerTeam(req.quiz, req.params.roundId);
            await calculateAndSavePoints(correctAnswersPerTeam);
            await finishRound(req.session.lobby!, req.params.roundId);

            broadcastToTeams(WebsocketEvents.ROUND_FINISHED, req.session.lobby);
            emitToScoreboard(WebsocketEvents.ROUND_FINISHED, req.session.lobby);
            res.status(200).json({
                message: 'Round finished'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * End the quiz
     */
    @Route('patch', '/quiz/:lobby')
    async endQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            await endQuiz(req.session.lobby);

            broadcastToTeams(WebsocketEvents.QUIZ_ENDED, req.session.lobby);
            emitToScoreboard(WebsocketEvents.QUIZ_ENDED, req.session.lobby);
            res.status(200).json({
                message: 'Quiz ended'
            });
        } catch (e) {
            next(e);
        }
    }
}

export default QuizMasterController;
