let mongoose = require('mongoose');

let makeConnection = () => {
  mongoose.connect('mongodb+srv://stephanwithph:stephanwithph123@quizzer.yy68h63.mongodb.net/?retryWrites=true&w=majority');
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
