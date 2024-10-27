import { Schema, Types } from 'mongoose';
import { Question, QuestionInterface } from './question';
import { GivenAnswerInterface, givenAnswerSchema } from './givenAnswer';
import { BaseModelInterface } from './base';

export interface AskedQuestionInterface extends BaseModelInterface {
    question: QuestionInterface;
    givenAnswers?: Types.DocumentArray<GivenAnswerInterface>;
    closed?: boolean;
}

export const askedQuestionSchema = new Schema(
    {
        question: {
            type: Types.ObjectId,
            ref: Question
        },
        givenAnswers: {
            type: [givenAnswerSchema],
            required: true,
            default: []
        },
        closed: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);
