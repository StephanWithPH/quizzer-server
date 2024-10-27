import { Server } from 'socket.io';
import { jwtVerify } from 'jose';
import { Request } from 'express';
import { JWT_SECRET_KEY } from './config/config';
import { Role } from './enums/role';
import { WebsocketEvents } from './enums/websocket';

let socketIOServer: Server;

export const setSocketIOServer = (server: Server) => {
    socketIOServer = server;
    socketIOServer.on('connection', (socket) => {
        const req = socket.request as Request;
        logging.log('Socket connected', socket.id);

        socket.on('TOKEN', async (message: string) => {
            try {
                logging.debug('Token received. Trying to authenticate.', message);
                const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);
                const { payload } = await jwtVerify(message, secretKey);

                // Get user that has at least this token in its tokens array
                socket.data.role = payload.role;
                socket.data.lobby = payload.lobby;
                socket.data._id = payload._id;

                socket.join(payload.lobby as string);

                logging.log(socket.id, 'Authenticated.');
            } catch (e) {
                logging.error(e);
            }
        });

        socket.on('disconnect', () => {
            logging.log('Socket disconnected', socket.id);
            socket.leave(req.session.lobby!);
        });
    });
};

export const emitToQuizMaster = (event: WebsocketEvents, lobby: string | undefined, data?: any) => {
    if (!lobby) return;

    const sockets = socketIOServer.sockets.adapter.rooms.get(lobby);
    sockets?.forEach((socketId) => {
        const socket = socketIOServer.sockets.sockets.get(socketId);
        if (socket?.data.role === Role.QUIZ_MASTER) {
            socket.emit(event, data);
        }
    });
};

export const emitToScoreboard = (event: WebsocketEvents, lobby: string | undefined, data?: any) => {
    if (!lobby) return;

    const sockets = socketIOServer.sockets.adapter.rooms.get(lobby);
    sockets?.forEach((socketId) => {
        const socket = socketIOServer.sockets.sockets.get(socketId);
        if (socket?.data.role === Role.SCOREBOARD) {
            socket.emit(event, data);
        }
    });
};

export const broadcastToTeams = (event: WebsocketEvents, lobby: string | undefined, data?: any) => {
    if (!lobby) return;
    const sockets = socketIOServer.sockets.adapter.rooms.get(lobby);
    sockets?.forEach((socketId) => {
        const socket = socketIOServer.sockets.sockets.get(socketId);
        if (socket?.data.role === Role.TEAM) {
            socket.emit(event, data);
        }
    });
};

export const emitToTeam = (event: WebsocketEvents, lobby: string | undefined, teamId: string, data?: any) => {
    if (!lobby || !teamId) return;
    const sockets = socketIOServer.sockets.adapter.rooms.get(lobby);
    sockets?.forEach((socketId) => {
        const socket = socketIOServer.sockets.sockets.get(socketId);
        if (socket?.data.role === Role.TEAM && socket.data._id === teamId) {
            socket.emit(event, data);
        }
    });
};
