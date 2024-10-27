import { Team } from '../models/team';
import { Quiz } from '../models/quiz';

export function createNewTeam(name: string, image: string | undefined) {
    const newTeam = new Team({
        name,
        image
    });
    return newTeam.save();
}

export function updateTeamAcceptedById(teamId: string) {
    return Team.findByIdAndUpdate(teamId, { accepted: true }, { new: true });
}

export async function updateTeamsAcceptedInLobby(lobbyCode: string | undefined) {
    const quiz = await Quiz.findOne({
        lobby: lobbyCode,
        finished: false
    })
        .populate('teams')
        .select('teams');

    if (!quiz) {
        throw new Error('Quiz not found');
    }
    for (const team of quiz.teams) {
        team.accepted = true;
        await team.save();
    }

    return quiz.teams;
}

export function deleteTeam(teamId: string) {
    return Team.findByIdAndDelete(teamId);
}

export function findTeamById(teamId: string) {
    return Team.findById(teamId);
}
