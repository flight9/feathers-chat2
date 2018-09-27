const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const local = require('@feathersjs/authentication-local');
// const { iff, disallow } = require('feathers-hooks-common');
const oauth2 = require('@feathersjs/authentication-oauth2');
const WechatStrategy = require('passport-wechat').Strategy;
var wxcfg = require('./modules/wechat/config');
const makeHandler = require('./oauth-handler');
const WechatVerifier = require('./modules/wechat/wechat-verifier');


module.exports = function (app) {
  const config = app.get('authentication');

  // Create a handler by passing the `app` object.
  const handler = makeHandler(app);

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
    callbackURL: wxcfg.serverDomain + 'auth/wechat/callback', //NOTE domain may changed
    idField: 'openid',
    successRedirect: '/success',   //useless if set 'handler'
    failureRedirect: '/failure',
    Verifier: WechatVerifier,
    handler: handler(wxcfg.clientDomain + '#/oauth-success')
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
      /* NOT SUGGESTED: if client logout once, this will fail because of losing oauthUserId
      // bind a user with wechat
      create: async function (context) {
        // console.log('After authentication create:', context);
        const userService = app.service('users');
        const strategy = context.data.strategy;
        const bindOauth = context.data.bindOauth;
        const oauthUserId = context.data.oauthUserId;
        const currentUser = context.params.user; // only authenticated successfully

        if (strategy == 'local' && bindOauth &&
          currentUser.bind_status != 'bound' &&
          currentUser._id != oauthUserId
        ) {
          let oauthUser = await userService.find({query: {_id: oauthUserId}});
          oauthUser = oauthUser.data[0];
          let data = {
            bind_status: 'bound',
            openid: oauthUser.openid,
            wechat: Object.assign({}, oauthUser.wechat)
          };

          // update current user
          let patchedUser = await userService.patch(currentUser._id, data);
          console.log('PatchedUser after binding', patchedUser);

          // delete oauth user
          let deletedUser = await userService.remove(oauthUserId);
          console.log('deletedUser after binding', deletedUser);
        }

        return context;
      }
      //*/
    }
  });
};
