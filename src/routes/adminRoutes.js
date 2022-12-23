const router = require('express').Router();
const {signJwt, verifyJwt} = require("../helpers/jwtHelper");

/**
 * Admin Login
 */
router.post('/login', async (req, res, next) => {
  try {
    const {password} = req.body;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (password === envPassword) {
      const token = await signJwt({
        role: 'admin',
      });
      res.status(200).json({token});
    } else {
      res.status(401).json({error: "Incorrect wachtwoord"});
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Admin Token Validation
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (await verifyJwt(token)) {
      res.status(200).json("Token is valide");
    } else {
      res.status(401).json({error: "Token is niet geldig"});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;