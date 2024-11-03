import { Quiz } from '../models/quiz';

export function createNewQuiz(lobby: string) {
    const newQuiz = new Quiz({
        lobby: lobby
    });
    return newQuiz.save();
}

export function findQuizByLobby(lobby: string | undefined) {
    return Quiz.findOne({ lobby: lobby })
        .populate('teams')
        .populate('rounds.askedQuestions.question')
        .populate('rounds.askedQuestions.givenAnswers.team');
}

export async function endQuiz(lobby: string | undefined) {
    return Quiz.findOneAndUpdate({ lobby: lobby }, { finished: true });
}
