const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
// const { iff, disallow } = require('feathers-hooks-common');


module.exports = function (app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    },
    after: {
      // ZM: To bind a user with openid
      create: async function (context) {
        // console.log('After create:', context);
        const users = app.service('users');
        const openid = context.data.openid;
        const user = context.params.user; // only authenticated successfully
        console.log('After create openid & user:', openid, user);

        // If visit from web or login by jwt, the openid must be undefined
        if (openid && user ) {
          if (!user.openid) {
            const upd = await users.update(user._id, {$set: {openid}});
            console.log('After create upd_user', upd);
          }
          else {
            // TODO: If a user already had a openid, bind will fail and server should throw an error
            // or other method to inform the frontend.
          }
        }

        return context;
      }
    }
  });
};
