import { Quiz } from '../models/quiz';
import { Types } from 'mongoose';
import { TeamInterface } from '../models/team';

export async function addNewRound(lobby: string | undefined, chosenCategories: string[]) {
    const quiz = await Quiz.findOneAndUpdate(
        { lobby: lobby, finished: false },
        {
            $push: {
                rounds: {
                    chosenCategories
                }
            }
        },
        { new: true }
    );

    if (!quiz) {
        throw new Error('Quiz bestaat niet');
    }

    return quiz.rounds[quiz.rounds.length - 1];
}

export function getAllRounds(lobby: string | undefined) {
    return Quiz.findOne({ lobby: lobby, finished: false })
        .populate('rounds.askedQuestions.question')
        .populate('rounds.askedQuestions.givenAnswers.team')
        .select('rounds');
}

export function getAllRoundsWithoutAnswers(lobby: string | undefined) {
    return Quiz.findOne({ lobby: lobby }).populate('rounds.askedQuestions.question', '-answer').select('-rounds.askedQuestions.givenAnswers');
}

export function closeAskedQuestion(lobby: string | undefined, roundId: string, askedQuestionId: string) {
    return Quiz.findOneAndUpdate(
        { lobby: lobby, finished: false, 'rounds.askedQuestions._id': askedQuestionId },
        {
            $set: {
                'rounds.$[element1].askedQuestions.$[element2].closed': true
            }
        },
        {
            arrayFilters: [{ 'element1._id': roundId }, { 'element2._id': askedQuestionId }],
            new: true
        }
    );
}

export async function addGivenAnswerToAskedQuestion(
    lobby: string | undefined,
    roundId: string,
    askedQuestionId: string,
    team: TeamInterface | undefined | null,
    answer: string
) {
    const quiz = await Quiz.findOne({ lobby: lobby, finished: false })
        .populate('rounds.askedQuestions.question')
        .populate('rounds.askedQuestions.givenAnswers.team');

    if (!quiz) {
        throw new Error('Quiz bestaat niet');
    }

    if (!team) {
        throw new Error('Team bestaat niet');
    }

    const round = quiz.rounds.id(roundId)!;
    const askedQuestion = round.askedQuestions.id(askedQuestionId)!;
    if (askedQuestion?.closed) {
        throw new Error('Deze vraag is al gesloten.');
    }
    // Insert or update given answer
    const givenAnswer = askedQuestion.givenAnswers?.find((givenAnswer) => {
        return givenAnswer.team._id.toString() === team?._id.toString();
    });
    if (givenAnswer) {
        givenAnswer.answer = answer;
    } else {
        askedQuestion?.givenAnswers?.push({
            _id: new Types.ObjectId(askedQuestionId),
            team,
            answer
        });
    }
    return quiz.save();
}

export async function updateGivenAnswer(
    lobby: string | undefined,
    roundId: string,
    askedQuestionId: string,
    givenAnswerId: string,
    isCorrect: boolean
) {
    const quiz = await Quiz.findOne({ lobby: lobby, finished: false })
        .populate('rounds.askedQuestions.question')
        .populate('rounds.askedQuestions.givenAnswers.team');

    if (!quiz) {
        throw new Error('Quiz bestaat niet');
    }

    const round = quiz.rounds.id(roundId)!;
    const askedQuestion = round.askedQuestions.id(askedQuestionId)!;
    const givenAnswer = askedQuestion.givenAnswers?.id(givenAnswerId);
    if (!givenAnswer) {
        throw new Error('Antwoord bestaat niet');
    }
    givenAnswer.isCorrect = isCorrect;
    return quiz?.save();
}

export async function finishRound(lobby: string | undefined, roundId: string) {
    return Quiz.findOneAndUpdate(
        { lobby: lobby, finished: false, 'rounds._id': roundId },
        {
            $set: {
                'rounds.$[element1].finished': true
            }
        },
        { arrayFilters: [{ 'element1._id': roundId }], new: true }
    );
}
