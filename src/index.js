const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const LOGIC = requre("./logic");

/**
 * Create a middleware function using a single logic function
 */
function createMiddleware(logic) {
  return (req, res, next) => {
    try {
      // if the logic func is true passes check
      if (logic(req)) {
        next();
        return;
      }

      res.sendStatus(403);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check if the request is made by a logged in user,
 * checks the req.user param
 */
const isLoggedIn = createMiddleware(LOGIC.isLoggedIn);

/**
 * Check if the request is made by an admin user,
 * checks the req.user.isAdmin param
 */
const isAdmin = createMiddleware(LOGIC.isAdmin);

/**
 * Check if the request was not made by a logged in user,
 * checks the req.user param
 *
 */
const isNotLoggedIn = createMiddleware(LOGIC.isNotLoggedIn);

/**
 * Check if the request is a locally made request
 *
 * origins can be somewhat faked, so this works with sort of
 * local api key, which should be passed in the query:
 *
 * EX:
 * `?local={process.env.LOCAL}`
 */
const isLocalRequest = createMiddleware(LOGIC.isLocalRequest);

/**
 * Check if the request has the required scope
 * checks req.api_key param
 *
 * @param {*} scope, the scope required
 * @returns {*} middleware func that onlyy allows requests with the given scope
 *
 */
const hasApiScope = (scope) => createMiddleware(LOGIC.hasApiScope(scope));

module.exports = {
  isLoggedIn,
  isAdmin,
  isNotLoggedIn,
  isLocalRequest,
  hasApiScope,
  upload,
  LOGIC,
};
