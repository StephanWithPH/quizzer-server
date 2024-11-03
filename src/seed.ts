import mongoose from 'mongoose';
import dotenv from 'dotenv';
import questions from './questions.json';
import { Question } from './models/question';
import { mongo } from './config/config';
dotenv.config();

// Database connection
mongoose.connect(mongo.MONGO_CONNECTION || '').then(() => {
    console.log('Database connected');
});

const insertQuestions = () => {
    Question.countDocuments({}).then((count) => {
        if (count > 0) {
            Question.deleteMany({ question: { $exists: true } }).then(() => {
                console.log('Old questions deleted');
            });
        }
        Question.insertMany(questions).then(() => {
            console.log('Questions inserted');
            console.log('# Questions inserted from file:', questions.length);
            mongoose.disconnect().then(() => {
                console.log('Database disconnected');
            });
        });
    });
};

insertQuestions();
