const User = require('../models/user');

async function findUserById(id) {
  return User.findById(id);
}

async function findUserByUserName(userName) {
  return User.findOne({userName});
}

module.exports = {
  findUserById,
  findUserByUserName,
}
