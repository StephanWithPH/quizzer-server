import { Types } from 'mongoose';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';

export function getCategoriesFromQuestions() {
    return Question.distinct('category');
}

export async function getQuestionsByLobby(lobby: string) {
    const quiz = await Quiz.findOne({ lobby: lobby, finished: false }).select('rounds').populate('rounds.askedQuestions.question');

    if (!quiz || quiz.rounds?.length === 0) {
        return [];
    }
    const round = quiz.rounds[quiz.rounds.length - 1];
    const roundCategories = round.chosenCategories;
    const allAskedQuestions = quiz.rounds.map((round) => round.askedQuestions);
    let questions = await Question.find({
        $and: [
            {
                // Find questions that haven't been asked yet
                _id: { $nin: allAskedQuestions.flat().map((askedQuestion) => askedQuestion.question._id) }
            },
            {
                // Find questions that are in one of the chosen categories
                category: { $in: roundCategories }
            }
        ]
    });

    // If all questions are already asked then return just all of them as a fallback
    if (questions.length === 0) {
        questions = await Question.find({ category: { $in: roundCategories } });
    }

    return questions;
}

export async function addAskedQuestion(lobby: string | undefined, roundId: string, questionId: string) {
    const quiz = await Quiz.findOne({ lobby: lobby, finished: false }).select('rounds').populate('rounds.askedQuestions.question');

    if (!quiz) {
        throw new Error('Quiz bestaat niet');
    }

    const round = quiz.rounds.id(roundId);
    const question = await Question.findById(questionId);

    if (!round || !question) {
        throw new Error('Ronde of vraag bestaat niet');
    }

    round?.askedQuestions.push({
        _id: new Types.ObjectId(questionId),
        question: question
    });

    return quiz.save();
}
