import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const DEBUG = (process.env.DEBUG || 'false') === 'true';
export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const MONGO_USER = process.env.MONGO_USER || '';
export const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
export const MONGO_URL = process.env.MONGO_URL || '';
export const MONGO_TABLE = process.env.MONGO_TABLE || '';
export const MONGO_PORT = process.env.MONGO_PORT || 27017;
export const MONGO_OPTIONS: mongoose.ConnectOptions = { retryWrites: true, w: 'majority' };

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;
export const SERVER_URL_PREFIX = process.env.SERVER_URL_PREFIX || '/api/v1';
export const SESSION_SECRET = process.env.SESSION_SECRET || '';

export const LOBBY_CODE_CHARACTERS_AMOUNT = process.env.LOBBY_CODE_CHARACTERS_AMOUNT ? Number(process.env.LOBBY_CODE_CHARACTERS_AMOUNT) : 5;
export const JWT_SECRET_KEY = process.env.JWT_SECRET || '';

const getMongoConnectionUrl = () => {
    if (MONGO_USER || MONGO_PASSWORD) {
        return `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_URL}:${MONGO_PORT}/${MONGO_TABLE}`;
    }

    return `mongodb://${MONGO_URL}:${MONGO_PORT}/${MONGO_TABLE}`;
};

export const mongo = {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_URL,
    MONGO_TABLE,
    MONGO_OPTIONS,
    MONGO_CONNECTION: getMongoConnectionUrl()
};

export const server = {
    SERVER_HOSTNAME,
    SERVER_PORT
};
