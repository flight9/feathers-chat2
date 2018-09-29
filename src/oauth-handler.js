
/**
 * export a function as handler to append jwt token as query string to successRecirect url
 * @param app
 * @returns {Function}
 */
module.exports = function (app) {
  return function (url) {
    const config = app.get('authentication');
    const options = {
      jwt: config.jwt,
      secret: config.secret
    };

    return function (req, res, next) {
      if (req.feathers && req.feathers.payload) {
        app.passport.createJWT(req.feathers.payload, options).then(token => {
          res.redirect(`${url}?wxjwt=${token}`);
        })
          .catch(error => {
            next(error);
          });
      }
    };
  };
};
