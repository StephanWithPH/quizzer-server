import { Schema, Types } from 'mongoose';
import { Team, TeamInterface } from './team';
import { BaseModelInterface } from './base';

export interface GivenAnswerInterface extends BaseModelInterface {
    answer: string;
    isCorrect: boolean;
    team: TeamInterface;
}

export const givenAnswerSchema = new Schema(
    {
        answer: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true,
            default: false
        },
        team: {
            type: Types.ObjectId,
            ref: Team,
            required: true
        }
    },
    {
        timestamps: true
    }
);
