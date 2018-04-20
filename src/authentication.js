const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
// const { iff, disallow } = require('feathers-hooks-common');
const oauth2 = require('@feathersjs/authentication-oauth2');
const Verifier = require('@feathersjs/authentication-oauth2').Verifier;
const WechatStrategy = require('passport-wechat').Strategy;
var wxcfg = require('./modules/wechat/config');

class WechatVerifier extends Verifier {
  // The verify function has the exact same inputs and
  // return values as a vanilla passport strategy
  verify(req, accessToken, refreshToken, profile, expiresIn, done) {
    super.verify(req, accessToken, refreshToken, profile, done);
  }
}


module.exports = function (app) {
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());
  app.configure(local());
  app.configure(oauth2({
    name: 'wechat',
    Strategy: WechatStrategy,
    clientID: wxcfg.appId, // Replace this with your app's Client ID
    appID: wxcfg.appId,
    clientSecret: wxcfg.appSecret, // Replace this with your app's Client Secret
    appSecret: wxcfg.appSecret,
    scope: 'snsapi_userinfo',
    state: 'state',
    // callbackURL: 'http://tri.s1.natapp.cc/auth/wechat/callback',
    callbackURL: 'http://flight9.free.ngrok.cc/auth/wechat/callback',
    idField: 'openid',
    successRedirect: '/success',
    failureRedirect: '/failure',
    Verifier: WechatVerifier
  }));

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
