import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { createBearerMiddleware, createRoleMiddleware } from '../middleware/authenticationMiddleware';
import { Role } from '../enums/role';
import { createFindQuizByLobbyCodeMiddleware, createQuizExistsMiddleware } from '../middleware/quizMiddleware';
import { getCorrectAnswersPerTeam, getPodiumTeams } from '../helpers/pointsHelper';
import { ICategorizedTeams } from '../interfaces/categorizedTeams';
import { TeamInterface } from '../models/team';
import { Request, Response, NextFunction } from 'express';
import { getAllRounds } from '../queries/roundQueries';

@Controller(
    '/scoreboard',
    createBearerMiddleware(),
    createRoleMiddleware(Role.SCOREBOARD),
    createQuizExistsMiddleware(),
    createFindQuizByLobbyCodeMiddleware()
)
export class ScoreboardController {
    /**
     * Get teams in quiz for scoreboard
     */
    @Route('get', '/quiz/:lobby/teams')
    async getTeams(req: Request, res: Response, next: NextFunction) {
        try {
            let teams: ICategorizedTeams | TeamInterface[];

            if (req.quiz?.teams === undefined) {
                const error = new Error('Teams not found');
                res.status(404);
                return next(error);
            }
            if (req.query.categorize === 'top3') {
                teams = getPodiumTeams(req.quiz.teams);
            } else {
                teams = req.quiz.teams.filter((team: TeamInterface) => team.accepted);
            }
            res.status(200).json(teams);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get all rounds for scoreboard
     */
    @Route('get', '/quiz/:lobby/rounds')
    async getRounds(req: Request, res: Response, next: NextFunction) {
        try {
            const rounds = await getAllRounds(req.quiz?.lobby);
            res.status(200).json(rounds?.rounds);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get correct answers for all teams
     */
    @Route('get', '/quiz/:lobby/rounds/:roundId/askedQuestions')
    async getCorrectAnswersPerTeam(req: Request, res: Response, next: NextFunction) {
        try {
            const { roundId } = req.params;
            const correctAnswersPerTeam = getCorrectAnswersPerTeam(req.quiz, roundId);
            res.status(200).json(correctAnswersPerTeam);
        } catch (e) {
            next(e);
        }
    }
}
