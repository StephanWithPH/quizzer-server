const calculateAndSavePoints = async (correctAnswersPerTeam) => {
    //Sort teams by points
    correctAnswersPerTeam.sort((a, b) => b.correctAnswers - a.correctAnswers);
    let remainingCorrectAnswers;

    // Check how many players are first with the same amount of points
    const firstPlaceCorrectAnswers = correctAnswersPerTeam.filter(answer => answer.correctAnswers === correctAnswersPerTeam[0].correctAnswers);
    //Reward the first place teams 4 points
    firstPlaceCorrectAnswers.forEach(answer => answer.team.roundPoints += 4);
    remainingCorrectAnswers = correctAnswersPerTeam.filter(x => !firstPlaceCorrectAnswers.includes(x));

    for (const answer of firstPlaceCorrectAnswers) {
        await answer.team.save();
    }

    // If there are only 2 teams, its a tie
    if (remainingCorrectAnswers.length === 0) {
        return;
    }

    // If there are more teams remaining, check if there are more teams with the same amount of points for second place
    const secondPlaceCorrectAnswers = remainingCorrectAnswers.filter(answer => answer.correctAnswers === remainingCorrectAnswers[0].correctAnswers);
    //Reward the second place teams 2 points
    secondPlaceCorrectAnswers.forEach(answer => answer.team.roundPoints += 2);
    remainingCorrectAnswers = remainingCorrectAnswers.filter(x => !secondPlaceCorrectAnswers.includes(x));

    for (const answer of secondPlaceCorrectAnswers) {
        await answer.team.save();
    }

    // If there are only no more teams, there is no third place
    if (remainingCorrectAnswers.length === 0) {
        return;
    }

    // If there are more teams remaining, check if there are more teams with the same amount of points third place
    const thirdPlaceCorrectAnswers = remainingCorrectAnswers.filter(answer => answer.correctAnswers === remainingCorrectAnswers[0].correctAnswers);
    //Reward the third place teams 1 points
    thirdPlaceCorrectAnswers.forEach(answer => answer.team.roundPoints += 1);
    remainingCorrectAnswers = remainingCorrectAnswers.filter(x => !thirdPlaceCorrectAnswers.includes(x));

    for (const answer of thirdPlaceCorrectAnswers) {
        await answer.team.save();
    }

    // If there are no more teams, there are no remaining teams to receive the minimum points
    if (remainingCorrectAnswers.length === 0) {
        return;
    }

    // If there are more teams remaining, they receive the minimum points
    //Reward the remaining teams 0,1 points for participating
    remainingCorrectAnswers.forEach(answer => answer.team.roundPoints += 0.1);
    for (const answer of remainingCorrectAnswers) {
        await answer.team.save();
    }
}

const getCorrectAnswersPerTeam = (quiz, roundId) => {
    let teams = quiz.teams;
    let lastRound = quiz.rounds.id(roundId);
    let askedQuestions = lastRound.askedQuestions;

    // Push all given answers to an array
    let correctAnswersPerTeam = [];

    // Populate correectAnswersPerTeam with objects for all teams
    teams.forEach(team => {
        correctAnswersPerTeam.push({
            team: team,
            correctAnswers: 0
        });
    });

    askedQuestions.forEach(askedQuestion => {
        askedQuestion.givenAnswers.forEach(givenAnswer => {
            // Check if given answer is correct
            if(givenAnswer.isCorrect) {
                // Check if team already has an entry
                let entry = correctAnswersPerTeam.find(entry => {
                    return entry.team._id.toString() === givenAnswer.team._id.toString();
                });
                if(entry) {
                    entry.correctAnswers = entry.correctAnswers + 1;
                }
            }
        });
    });

    return correctAnswersPerTeam;
}

const getPodiumTeams = (teams) => {
    let remainingTeams = [...teams];
    let categorizedTeamsObject = {
        firstPlace: [],
        secondPlace: [],
        thirdPlace: [],
    }
    // Sort teams by points
    remainingTeams.sort((a, b) => b.roundPoints - a.roundPoints);

    // Populate array with teams on first place
    let firstPlaceTeams = remainingTeams.filter(team => team.roundPoints === remainingTeams[0].roundPoints);
    // Remove firstplaceteams from teams array
    remainingTeams = remainingTeams.filter(team => !firstPlaceTeams.includes(team));

    categorizedTeamsObject.firstPlace = firstPlaceTeams;

    if(remainingTeams.length === 0) {
        return categorizedTeamsObject;
    }

    // Populate array with teams on second place
    let secondPlaceTeams = remainingTeams.filter(team => team.roundPoints === remainingTeams[0].roundPoints);
    // Remove secondplaceteams from teams array
    remainingTeams = remainingTeams.filter(team => !secondPlaceTeams.includes(team));

    categorizedTeamsObject.secondPlace = secondPlaceTeams;

    if(remainingTeams.length === 0) {
        return categorizedTeamsObject;
    }

    // Populate array with teams on third place
    let thirdPlaceTeams = remainingTeams.filter(team => team.roundPoints === remainingTeams[0].roundPoints);
    // Remove thirdplaceteams from teams array
    remainingTeams = remainingTeams.filter(team => !thirdPlaceTeams.includes(team));

    categorizedTeamsObject.thirdPlace = thirdPlaceTeams;

    return categorizedTeamsObject;
}

module.exports = {
    calculateAndSavePoints,
    getCorrectAnswersPerTeam,
    getPodiumTeams
}
