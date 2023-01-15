const {findQuizByLobby} = require("../queries/quizQueries");
const {findTeamById} = require("../queries/teamQueries");
const jose = require("jose");
const {validateImageType} = require("../helpers/imageHelper");
const {findUserById} = require("../queries/userQueries");
const Team = require("../models/team");

/**
 * Middleware to check if the length of the team name is not too long
 */
const createTeamNameLengthMiddleware = (length = 30) => {
  return (async (req, res, next) => {
    if (req.body.name && req.body.name.length > length) {
      let error = new Error("Team naam is te lang");
      error.status = 400;
      return next(error);
    }
    next();
  });
}

/**
 * Validates the provided image type
 */
const createImageTypeMiddleware = () => {
  return (async (req, res, next) => {
    if (req.body.base64Image) {
      if (validateImageType(req.body.base64Image) === false) {
        const error = new Error("Ongeldig bestandstype");
        error.status = 400;
        return next(error);
      }
    }
    next();
  });
}

/**
 * Middleware to check if the team name exists
 */
const createTeamNameExistsMiddleware = () => {
  return (async (req, res, next) => {
    if(!req.body.name || req.body.name.trim().length === 0) {
      const error = new Error("Geen naam meegegeven");
      error.status = 400;
      return next(error);
    }
    next();
  });
}

/**
 * Middleware to check if role is really a certain role
 */
const createRoleMiddleware = (role) => {
  return (req, res, next) => {
    if(req.session.role !== role) {
      let error = new Error("Deze route is niet toegankelijk met uw rol");
      error.status = 403;
      return next(error);
    }
    next();
  }
}

/**
 * Middleware to check if user is authenticated with a valid bearer token
 */
const checkIfUserAuthenticatedWithBearerToken = () => async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    const error = new Error('Geen authorisatie header meegegeven');
    error.status = 401;
    return next(error);
  }
  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    const error = new Error('Geen token gevonden in de authorisatie header');
    error.status = 401;
    return next(error);
  }
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

  try {
    const {
      payload,
      protectedHeader
    } = await jose.jwtVerify(token, secretKey);

    // Get user that has at least this token in its tokens array
    req.session = {...payload};

    next();
  } catch (e) {
    const error = new Error("Ongeldige sessie");
    error.status = 401;
    next(error);
  }
};

/**
 * Middleware to find quiz by lobby code
 */
const createFindQuizByLobbyCodeMiddleware = () => {
  return (async (req, res, next) => {
    req.quiz = await findQuizByLobby(req.session.lobby);
    next();
  });
}

/**
 * Middleware to find model by id, else return error
 */
const createFindModelByIdMiddleware = (model) => {
  return (async (req, res, next) => {
    const foundModel = await model.findById(req.session._id);
    if(!foundModel) {
      const error = new Error(`Ingelogde gebruiker van type ${model.collection.modelName} niet gevonden`);
      error.status = 404;
      return next(error);
    }
    req[model.collection.modelName.toLowerCase()] = foundModel;
    next();
  });
}

/**
 * Middleware to check if quiz exists
 */
const createQuizExistsMiddleware = () => {
  return (async (req, res, next) => {
    if (req.quiz === null) {
      let error = new Error("Quiz niet gevonden");
      error.status = 404;
      return next(error);
    }
    next();
  });
}

/**
 * Middleware to check if team exists
 */
const createTeamExistsMiddleware = () => {
  return (async (req, res, next) => {
    if (req.team === null) {
      let error = new Error("Team niet gevonden");
      error.status = 404;
      return next(error);
    }
    next();
  });
}

/**
 * Middleware to check if team accepted exists
 */
const createTeamAcceptedMiddleware = () => {
  return (async (req, res, next) => {
    if (req.team.accepted === false) {
      let error = new Error("Team niet geaccepteerd");
      error.status = 403;
      return next(error);
    }
    next();
  });
}

/**
 * Geen antwoord meegegeven
 */
const createAnswerExistsMiddleware = () => {
  return (async (req, res, next) => {
    if (!req.body.answer || req.body.answer.trim().length === 0) {
      const error = new Error("Geen antwoord meegegeven");
      error.status = 400;
      return next(error);
    }
    next();
  });
}

/**
 * Middleware to check if the length of the given answer name is not too long
 */
const createAnswerQuestionLengthMiddleware = (length = 35) => {
  return (async (req, res, next) => {
    if (req.body.answer && req.body.answer.length > length) {
      let error = new Error("Antwoord op de vraag is te lang");
      error.status = 400;
      return next(error);
    }
    next();
  });
}

module.exports = {
  createRoleMiddleware,
  createImageTypeMiddleware,
  createFindQuizByLobbyCodeMiddleware,
  createQuizExistsMiddleware,
  createTeamAcceptedMiddleware,
  createTeamExistsMiddleware,
  createTeamNameLengthMiddleware,
  createAnswerQuestionLengthMiddleware,
  createTeamNameExistsMiddleware,
  createAnswerExistsMiddleware,
  checkIfUserAuthenticatedWithBearerToken,
  createFindModelByIdMiddleware,
}
