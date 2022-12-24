// Load .env file
require('dotenv').config({
  path: '../.env'
});

const express = require('express');
const cors = require('cors');               // needed for using webpack-devserver with express server
const bodyParser = require('body-parser')
const http = require('http');
const WebSocket = require('ws');
const {setWebsocketServer, broadcastToAdmin} = require("./socketserver");
const {makeConnection, getMongoose} = require("./helpers/mongooseHelper");
const Store = require("express-session/session/store");
const jose = require("jose");
const {staticFolder} = require("./constants");

const app = express();
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

makeConnection();

// Cors options
app.use(cors({origin: true, credentials: true}));
app.options("*", cors({origin: true, credentials: true}));
app.set('trust proxy', 1);

app.use('/static', express.static(staticFolder))

app.use(bodyParser.json({
  extended: true,
  limit: '500mb'
}));

// Routes

app.get('/ping', (req, res) => {
  res.status(200).json({message: 'pong'});
});

app.use('/api/v1/quizmaster', require('./routes/quizmasterRoutes'));
app.use('/api/v1/team', require('./routes/teamRoutes'));
app.use('/api/v1/scoreboard', require('./routes/scoreboardRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use((err, req, res, next) => {
  res.status(err.status ? err.status : 500).json({
    error: err.message ? err.message : 'Something went wrong',
  });
});


const httpServer = http.createServer(app);

const websocketServer = new WebSocket.Server({noServer: true});
setWebsocketServer(websocketServer);

httpServer.on('upgrade', (req, networkSocket, head) => {
  console.log('Upgrading websocket.');

  websocketServer.handleUpgrade(req, networkSocket, head, newWebSocket => {
    websocketServer.emit('connection', newWebSocket, req);
  });
});


websocketServer.on('connection', (socket, req) => {
  console.log('Websocket connected.');

  socket.on('close', () => {
    if (socket.session.role === 'admin') {
      broadcastToAdmin('SOCKET_DISCONNECTED');
    }
  });

  socket.on('message', async (msg) => {
    try {
      let jsonMsg = JSON.parse(msg);
      if (jsonMsg.type === 'TOKEN') {
        console.log('Token received. Trying to authenticate.');
        const {
          payload,
          protectedHeader
        } = await jose.jwtVerify(jsonMsg.payload, secretKey);
        // Get user that has at least this token in its tokens array
        socket.session = {...payload};
        console.log('Authenticated.');
        if (socket.session.role === 'admin') {
          broadcastToAdmin("SOCKET_CONNECTED");
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  });
});

setInterval(() => {
  websocketServer.clients.forEach(client => {
    client.send(JSON.stringify({
      "type": "PING"
    }));
  });
}, 20000);

// Start the server.
const port = process.env.PORT || 4000;
httpServer.listen(port, () => console.log(`Listening on port ${port}`));
