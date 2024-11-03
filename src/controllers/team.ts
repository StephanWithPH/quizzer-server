import { Controller } from '../decorators/controller';
import { createBearerMiddleware, createRoleMiddleware } from '../middleware/authenticationMiddleware';
import { Role } from '../enums/role';
import { createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware } from '../middleware/quizMiddleware';
import { Route } from '../decorators/route';
import { addGivenAnswerToAskedQuestion, getAllRoundsWithoutAnswers } from '../queries/roundQueries';
import { NextFunction, Request, Response } from 'express';
import { emitToQuizMaster, emitToScoreboard } from '../socket.io';
import { WebsocketEvents } from '../enums/websocket';
import {
    createAnswerProvidedMiddleware,
    createFindTeamByIdMiddleware,
    createTeamAcceptedMiddleware,
    createAnswerQuestionLengthMiddleware
} from '../middleware/teamMiddleware';

@Controller(
    '/team',
    createBearerMiddleware(),
    createRoleMiddleware(Role.TEAM),
    createFindQuizByLobbyCodeMiddleware(),
    createFindTeamByIdMiddleware(),
    createQuizExistsMiddleware(),
    createTeamAcceptedMiddleware()
)
class TeamController {
    /**
     * Get current quiz rounds state
     */
    @Route('get', '/quiz/:lobby/rounds')
    async getRounds(req: Request, res: Response, next: NextFunction) {
        try {
            const rounds = await getAllRoundsWithoutAnswers(req.session.lobby);
            return res.status(200).json(rounds?.rounds);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Answer an asked question
     */
    @Route(
        'post',
        '/quiz/:lobby/rounds/:roundId/askedQuestions/:askedQuestionId/givenAnswers',
        createAnswerProvidedMiddleware(),
        createAnswerQuestionLengthMiddleware()
    )
    async answerQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const { answer } = req.body;
            const { lobby, roundId, askedQuestionId } = req.params;

            await addGivenAnswerToAskedQuestion(lobby, roundId, askedQuestionId, req.team, answer);
            emitToQuizMaster(WebsocketEvents.TEAM_ANSWERED, req.session.lobby);
            emitToScoreboard(WebsocketEvents.TEAM_ANSWERED, req.session.lobby);
            return res.status(201).json({
                message: 'Antwoord is opgeslagen'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get team information
     */
    @Route('get', '/quiz/:lobby/teams/:teamId')
    async getTeam(req: Request, res: Response, next: NextFunction) {
        try {
            return res.status(200).json(req.team);
        } catch (e) {
            next(e);
        }
    }
}

export default TeamController;
