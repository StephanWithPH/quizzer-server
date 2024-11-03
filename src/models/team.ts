import { model, Schema, Document } from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { STATIC_FOLDER_NAME, TEAM_PLACEHOLDERS_FOLDER, TEAM_PLACEHOLDERS_FOLDER_NAME } from '../config/constants';
import { BaseModelInterface } from './base';

export interface TeamInterface extends BaseModelInterface {
    name: string;
    roundPoints: number;
    accepted: boolean;
    image: string;
}

const getRandomTeamImage = () => {
    // check how many images are in the folder
    const files = fs.readdirSync(TEAM_PLACEHOLDERS_FOLDER);
    // return a random image
    if (files.length === 0) {
        return undefined;
    }
    const randomNumber = Math.floor(Math.random() * files.length);
    return path.join(STATIC_FOLDER_NAME, TEAM_PLACEHOLDERS_FOLDER_NAME, files[randomNumber]);
};

export const teamSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        roundPoints: {
            type: Number,
            required: true,
            default: 0
        },
        accepted: {
            type: Boolean,
            required: true,
            default: false
        },
        image: {
            type: String,
            required: false,
            default: () => (process.env.RANDOM_TEAM_IMAGES ? getRandomTeamImage() : '')
        }
    },
    {
        timestamps: true
    }
);

export const Team = model<TeamInterface & Document>('Team', teamSchema);
