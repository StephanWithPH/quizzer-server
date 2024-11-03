import { model, Schema, Types, Document } from 'mongoose';
import { Team, TeamInterface } from './team';
import { RoundInterface, roundSchema } from './round';
import { BaseModelInterface } from './base';

export interface QuizInterface extends BaseModelInterface {
    teams: Types.DocumentArray<TeamInterface>;
    rounds: Types.DocumentArray<RoundInterface>;
    lobby: string;
    finished?: boolean;
}

export const quizSchema = new Schema(
    {
        teams: [
            {
                type: Types.ObjectId,
                ref: Team
            }
        ],
        lobby: {
            type: String,
            required: true
        },
        rounds: {
            type: [roundSchema],
            required: true,
            default: []
        },
        finished: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Quiz = model<QuizInterface & Document>('Quiz', quizSchema);
