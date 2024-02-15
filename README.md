# What is this

This is a simple module comtaining express type middleware made to be used for services linked into backbone (and backbone itself).

I got tired of copy pasting these functions lol.

If you make a custom middleware which could be used in other services feel free to make a pull request. If it needs an earlier middleware for prep note that in the pull request, and make a pull request to backbone to add that there.

## Included methods:

### Basic Middleware

- `isLoggedIn(req, res, next)`:
  Allows the request through if the user is logged in
- `isAdmin(req, res, next)`:
  Allows the request through if the user is an admin
- `isNotLoggedIn(req, res, next)`:
  Allows the request through if the user is not logged in
- `isLocalRequest(req, res, next)`:
  Allows the request through if the request is a local request
- `upload`:
  Multer upload middleware, just included here so every service has a standard onoe for handling file uploads

#### Example usage:

All of these functions (except upload, check multer docs) are used the same way:

```js
// allow the request if the user is logged in
app.use("route", isLoggedIn, (req, res, next)=>{...})
```

### Middleware generators

These functions arent middleware themselves, but rather return a middleware function

Some of these require "logic" functions which are just functions which take the req param and either return true to allow the request or false to deny the request.

- `hasApiScope(scope)`:
  Returns a middleware function which allows the request through if they have included an api_key with the proper scope access in their request.

  Example usage:

  ```js
  // use it in the express app or router
  // only let requests with an api_key with scope "scope" through
  app.use("route", hasApiScope("scope"), (req,res,next)=>{...})
  ```

- `createMiddleware(logic)`:
  Returns a middleware function which allows the request through if the passed function, `logic` evaluates to true with passed the request object.

  Example usage:

  ```js
  // return true if the request has a sus param
  const isSus = (req) => req.sus
  // make the middleware
  const isSusMiddleware = createMiddleware(isSus);
  // use it in the express app or router
  app.use("route", isSusMiddleware, (req,res,next)=>{...})
  ```

- `LOGIC.combineOr(...)`:
  Returns a middleware function which allows the request through if any of the logic functions return true.

  Example usage:

  ```js
  // let the request through if the user is logged in or has a matching api key
  app.use(
    "route",
    LOGIC.combineOr(LOGIC.isLoggedIn, LOGIC.hasApiScope("scope")), (req,res,next)=>{...})
  ```

- `LOGIC.combineAnd(...)`:
  Returns a middleware function which allows the request through if all of the logic functions return true.

  Example usage:

  ```js
  // let the request through if the user is logged in and the request has a matching api key
  app.use(
    "route",
    LOGIC.combineOr(LOGIC.isLoggedIn, LOGIC.hasApiScope("scope")), (req,res,next)=>{...})
  ```

### LOGIC functions:

A collection of functions that do the logic checks for the middleware described above. They can be used to make middleware through the `LOGIC.combineOr`, `LOGIC.combineAnd`, and `createMiddleware` functions.


- `LOGIC.isLoggedIn(req)`:
  true if the user is logged in, otherwise false
- `LOGIC.isAdmin(req)`:
  true if the user is an admin, otherwise false
- `LOGIC.isNotLoggedIn(req)`:
  true if the user is not logged in, otherwise false
- `LOGIC.isLocalRequest(req)`:
  true if the request is a local request, otherwise false
- `LOGIC.hasApiScope(scope)`:
  returns a logic function that is true if the request has an apikey with the given scope access, otherwise raises an error letting the client know they dont have scope access with a detailed message.

#### Custom logic functions:

Of course custom logic functions can be made, they just need to return a boolean which is true to allow the request and false to deny it (defaults to `403` status). It can also raise an error with a message and status (which also denys the request):

```js
// let through any req that doesnt have .value = 420, and raise custom error if it is 420

const myLogic = (req) => {
  if (req.value == 420) {
    err = new Error("Overused joke detected");
    // set status, defaults to 500
    err.status = 403;
    throw err;
  }

  return true;
};

// make the middleware
const myMiddleware = createMiddleware(mylogic);

// use it
app.use("route", myMddleware, (req,res,next)=> {...})
```

The functions could also be coombined in a more complicated way by making a custom logic function:
```js
// theres not too much point in doing this and using the createMiddleware func but it's an option (why not make ur own middleware func directly lol)
const weirdCombo = (req) => LOGIC.isLoggedIn(req) || LOGIC.hasApiScope("foo")(req) && !LOGIC.hasApiScope("bar")(req)
const weirdMiddleare = createMiddleware(weirdCombo)
```
