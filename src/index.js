const session = require('express-session');
const express = require('express');
const cors = require('cors');               // needed for using webpack-devserver with express server
const bodyParser = require('body-parser')
const http = require('http');
const WebSocket = require('ws');
const {setWebsocketServer} = require("./socketserver");
const {makeConnection} = require("./helpers/mongooseHelper");

const app = express();
makeConnection();

// Cors options
app.use(cors({origin: true, credentials: true}));
app.options("*", cors({origin: true, credentials: true}));
app.set('trust proxy', 1);

app.use('/static', express.static('static'))

app.use(bodyParser.json({
  extended: true,
  limit: '500mb'
}));

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false,
  cookie : {
    sameSite: 'none',
	secure: true
  }
});
app.use(sessionParser);

/// Routes

app.get('/ping', (req, res) => {
  res.status(200).json({message: 'pong'});
});

app.use('/api/v1/quizmaster', require('./routes/quizmasterRoutes'));
app.use('/api/v1/team', require('./routes/teamRoutes'));
app.use('/api/v1/scoreboard', require('./routes/scoreboardRoutes'));

app.use((err, req, res, next) => {
  res.status(err.status ? err.status : 500).json({
    error: err.message ? err.message : 'Something went wrong',
  });
});


const httpServer = http.createServer(app);

const websocketServer = new WebSocket.Server({noServer: true});
setWebsocketServer(websocketServer);

httpServer.on('upgrade', (req, networkSocket, head) => {
  sessionParser(req, {}, () => {


    console.log('Session is parsed to websocket.');

    websocketServer.handleUpgrade(req, networkSocket, head, newWebSocket => {
      websocketServer.emit('connection', newWebSocket, req);
    });
  });
});


websocketServer.on('connection', (socket, req) => {
  socket.session = req.session;
});

// Start the server.
const port = process.env.PORT || 4000;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));
