const Quiz = require('./models/quiz');

let server;

let setWebsocketServer = (obj) => {
  server = obj;
}

let getWebsocketServer = () => {
  return server;
}

let broadcastToTeams = async (event, lobby) => {
  let quiz = await Quiz.findOne({lobby: lobby}).populate('teams');
  server.clients.forEach(client => {
    let team = quiz.teams.find((team) => team._id.toString() === client.session._id);
    if (client.session.role === 'team' && client.session.lobby === lobby && team && team.accepted) {
      client.send(JSON.stringify({type: event}));
    }
  });
}

let broadcastToTeam = (event, lobby, teamId, disconnect = false) => {
  server.clients.forEach(client => {
    if (client.session.role === 'team' && client.session.lobby === lobby && client.session._id === teamId) {
      client.send(JSON.stringify({type: event}));
      if(disconnect) {
        client.close();
      }
    }
  });
}

function broadcastToQuizmaster(event, lobby) {
  getWebsocketServer().clients.forEach(client => {
    if (client.session.role === 'qm' && client.session.lobby === lobby) {
      client.send(JSON.stringify({type: event}));
    }
  });
}

function broadcastToScoreboard(event, lobby) {
  getWebsocketServer().clients.forEach(client => {
    if (client.session.role === "sb" && client.session.lobby === lobby) {
      client.send(JSON.stringify({type: event}));
    }
  });
}

module.exports = {
  setWebsocketServer,
  getWebsocketServer,
  broadcastToTeams,
  broadcastToTeam,
  broadcastToQuizmaster,
  broadcastToScoreboard
}
