let mongoose = require('mongoose');

let makeConnection = () => {
  mongoose.connect('mongodb://localhost:27017/quizzer');
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log("DB connected!");
  });
}

let closeConnection = () => {
  mongoose.connection.close();
}

let getMongoose = () => {
  return mongoose;
}

module.exports = {
  makeConnection,
  closeConnection,
  getMongoose
}
