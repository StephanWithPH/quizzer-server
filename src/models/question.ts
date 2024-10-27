import { model, Schema, Document } from 'mongoose';
import { BaseModelInterface } from './base';

export interface QuestionInterface extends BaseModelInterface {
    question: string;
    answer: string;
    category: string;
    image?: string;
}

export const questionSchema = new Schema(
    {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

export const Question = model<QuestionInterface & Document>('Question', questionSchema);
