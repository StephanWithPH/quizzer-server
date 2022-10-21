const Team = require('../models/team');

function createNewTeam(name, image) {
  // Mongoose create new team with model
  const newTeam = new Team({
    name,
    image
  });
  return newTeam.save();
}

function updateTeamAcceptedById(teamId, accepted = true) {
  return Team.findByIdAndUpdate(teamId, {accepted}, {new: true});
}

async function updateTeamsAcceptedInLobby(lobbyCode) {
  const teams = await Team.find({ lobbyCode, accepted: false});
  for (const team of teams) {
    team.accepted = true;
    await team.save();
  }
  return teams;
}

function deleteTeam(teamId) {
  return Team.findByIdAndDelete(teamId);
}

function findTeamById(teamId) {
  return Team.findById(teamId);
}

module.exports = {
  createNewTeam,
  updateTeamAcceptedById,
  updateTeamsAcceptedInLobby,
  deleteTeam,
  findTeamById
}
