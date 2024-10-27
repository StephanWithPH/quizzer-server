import { Schema, Types } from 'mongoose';
import { AskedQuestionInterface, askedQuestionSchema } from './askedQuestion';
import { BaseModelInterface } from './base';

export interface RoundInterface extends BaseModelInterface {
    askedQuestions: Types.DocumentArray<AskedQuestionInterface>;
    finished: boolean;
    chosenCategories: string[];
}

export const roundSchema = new Schema(
    {
        askedQuestions: {
            type: [askedQuestionSchema],
            required: true,
            default: []
        },
        finished: {
            type: Boolean,
            required: true,
            default: false
        },
        chosenCategories: {
            type: [String],
            required: true,
            default: []
        }
    },
    {
        timestamps: true
    }
);
