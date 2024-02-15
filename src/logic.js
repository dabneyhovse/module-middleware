/**
 * Seperate out the logic checks for the middleware so they can be combined
 */

/**
 * Check if the request is a locally made request
 *
 * origins can be somewhat faked, so this works with sort of
 * local api key, which should be passed in the query:
 *
 * EX:
 * `?local={process.env.LOCAL}`
 *
 * @param {*} req
 *
 * @returns bool: true if the request is local
 */
const isLocalRequest = (req) =>
  req.query && req.query.local == process.env.LOCAL;

/**
 * Check if the request is made by a logged in user,
 * checks the req.user param
 *
 * @param {*} req
 *
 * @returns bool: true if the request is from a logged in user
 */
const isLoggedIn = (req) => req.user;

/**
 * Check if the request is made by an admin user,
 * checks the req.user.isAdmin param
 *
 * @param {*} req
 *
 * @returns bool: true if the request is from an admin user
 */
const isAdmin = (req) => req.user && req.user.isAdmin;

/**
 * Check if the request was not made by a logged in user,
 * checks the req.user param
 *
 * @param {*} req
 *
 * @returns bool: true if the request is from an not logged user
 *
 */
const isNotLoggedIn = (req) => isLoggedIn(req, _, _);

/**
 * Check if the request has the required scope
 * checks req.api_key param
 *
 * NOTE: always put this last as it can raise errors (expecting key etc) unlike the others
 *
 * @param {*} scope, the scope required
 *
 */
const hasApiScope = (scope) => (req) => {
  // no api key
  if (!req.api_key) {
    err = new Error("Missing api key");
    err.status = 403;
    throw err;
  }

  // grab the scopes out of the obj, array of strings
  let { scopes } = req.api_key;
  if (scopes.includes(scope)) {
    return true;
  }

  // does not scope, throw error
  err = new Error(
    `Your api key does not have the required scope (${scope}) for this request. If this request was not made in error you should contact the comptrollers and ask for access to the scope`
  );
  err.status = 403;
  throw err;
};

/**
 * combine middleware function for combining logic functions
 * combines middleware with logical or (any middleware condition is met,
 * makes it go to the next)
 *
 * returns middleware function
 */
function combineOr() {
  return (req, res, next) => {
    try {
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i](req)) {
          next();
          return;
        }
      }
      res.sendStatus(403);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * combine middleware function for combining logic functions
 * combines middleware with logical and (if all middleware conditions are met,
 * makes it go to the next)
 *
 * returns middleware function
 */
function combineAnd() {
  return (req, res, next) => {
    try {
      for (let i = 0; i < arguments.length; i++) {
        if (!arguments[i](req)) {
          res.sendStatus(403);
          return;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  isLocalRequest,
  isLoggedIn,
  isNotLoggedIn,
  isAdmin,
  hasApiScope,
  combineOr,
  combineAnd,
};
