const jose = require("jose");

const signJwt = async (payload) => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

  return await new jose.SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime('1w')
    .sign(secretKey);
}

module.exports = {
  signJwt
}
