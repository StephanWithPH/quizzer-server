const generateLobbyCode = (length) => {
  let code = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = alphabet.length;
  for (let i = 0; i < length; i++) {
    code += alphabet.charAt(Math.floor(Math.random()
      * charactersLength));
  }
  return code;
};

module.exports = {
  generateLobbyCode
};
