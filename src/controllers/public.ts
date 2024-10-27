import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Request, Response, NextFunction } from 'express';
import { generateLobbyCode } from '../helpers/lobbyCodeHelper';
import { Quiz } from '../models/quiz';
import { createNewQuiz } from '../queries/quizQueries';
import { signJwt } from '../helpers/jwtHelper';
import { Role } from '../enums/role';
import { createTeamNameMaxLengthMiddleware, createTeamNameUniqueMiddleware } from '../middleware/teamMiddleware';
import { createNewTeam } from '../queries/teamQueries';
import { emitToQuizMaster } from '../socket.io';
import { WebsocketEvents } from '../enums/websocket';
import { writeBase64ToFileInTargetFolder } from '../helpers/base64Helper';

/**
 * Controller for public routes
 */
@Controller()
class PublicController {
    /**
      Create a new quiz (By QuizMaster)
     */
    @Route('post', '/quizMaster/quiz')
    async createQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            let generatedLobbyCode = generateLobbyCode();

            let uniqueLobbyCode = false;

            // Check if unique in database, else generate new lobby code
            while (!uniqueLobbyCode) {
                const count = await Quiz.countDocuments({ lobby: generatedLobbyCode, finished: false });
                if (count === 0) {
                    uniqueLobbyCode = true;
                } else {
                    generatedLobbyCode = generateLobbyCode();
                }
            }

            // Insert new quiz into database
            createNewQuiz(generatedLobbyCode).then(async (quiz) => {
                const resQuiz = quiz.toObject();
                resQuiz.token = await signJwt({
                    role: Role.QUIZ_MASTER,
                    lobby: generatedLobbyCode
                });
                res.status(201).json(resQuiz);
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Join the quiz (By Team)
     */
    @Route('post', '/team/quiz/:lobby/join', createTeamNameUniqueMiddleware(), createTeamNameMaxLengthMiddleware())
    async joinQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, image } = req.body;
            const { lobby } = req.params;

            // Get lobby by lobbyCode
            const quiz = await Quiz.findOne({ lobby: lobby, finished: false }).populate('teams');

            // If no active quiz is found send back error
            if (quiz === null) {
                const error = new Error('Quiz niet gevonden');
                res.status(404);
                return next(error);
            }

            if (quiz.rounds.length > 0) {
                const error = new Error('Quiz is al gestart');
                res.status(403);
                return next(error);
            }

            const teamWithNameExists = quiz.teams.find((team) => team.name === name);

            if (teamWithNameExists) {
                const error = new Error('Team met deze naam bestaat al');
                res.status(409);
                return next(error);
            }

            // Check if there is an image, if yes then save it and retrieve the path
            let imagePath: string | undefined = undefined;
            if (image && image.length > 0) {
                imagePath = writeBase64ToFileInTargetFolder(image);
            }

            // Create new team and push it to the quiz
            const newTeam = await createNewTeam(name, imagePath);

            quiz.teams.push(newTeam);
            quiz.save();

            const resTeam = newTeam.toObject();

            // Set session credentials for this new team, so we can identify it in later requests
            resTeam.token = await signJwt({
                role: Role.TEAM,
                lobby: lobby,
                _id: newTeam._id
            });

            // Send websocket event somewhere here to let the quizMaster retrieve all teams again because a new entry is made
            emitToQuizMaster(WebsocketEvents.TEAM_JOINED, lobby);

            return res.status(201).json(resTeam);
        } catch (e) {
            next(e);
        }
    }
    /**
     * Connect the scoreboard to the quiz
     */
    @Route('post', '/scoreboard/quiz/:lobby/scoreboard')
    async connectScoreboard(req: Request, res: Response, next: NextFunction) {
        try {
            const { lobby } = req.params;

            const quiz = await Quiz.findOne({ lobby: lobby, finished: false });

            // If no active quiz is found send back error
            if (quiz === null) {
                const error = new Error('Quiz niet gevonden');
                res.status(404);
                return next(error);
            }

            // Let the quizMaster know the scoreboard has been connected
            emitToQuizMaster(WebsocketEvents.SCOREBOARD_CONNECTED, lobby);

            const jwt = await signJwt({
                role: Role.SCOREBOARD,
                lobby: lobby
            });

            res.status(200).json({
                message: 'Scoreboard connected',
                token: jwt
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get the status of the server
     */
    @Route('get', '/status')
    async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json({ status: 'ok' });
        } catch (e) {
            next(e);
        }
    }
}

export default PublicController;
