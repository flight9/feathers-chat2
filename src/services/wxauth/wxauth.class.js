const oauthApi = require('../../modules/wechat/oauth_api');
const {promisify} = require('util');

/* eslint-disable no-unused-vars */
class Service {
  constructor (options, app) {
    this.options = options || {};
    this.app = app || {};
  }

  async find (params) {
    console.log(`params are:`, params);
    var result = {};
    var status = 400;
    var query = params.query || {};

    switch (query.type) {
    case 'url':
      // Call the wechat api
      var callbackURL = 'http://eqks7z.natappfree.cc/#/launch';
      var url = oauthApi.getAuthorizeURL(callbackURL,'state','snsapi_userinfo');
      result = {url};
      status = 200;
      break;

    case 'token':
      var code = query.code;
      var res;

      // Call wechat api
      const getAccessTokenAsync = promisify(oauthApi.getAccessToken).bind(oauthApi);
      res = await getAccessTokenAsync(code).catch(err => {
        console.error('getAccessTokenAsync err:', err);
      });

      // Query db
      if(res && res.data) {
        // we skip result.data.access_token;
        var openid = res.data.openid;
        res = await this.app.service('users').find({query: {openid, $limit:1}}).catch(err => {
          console.error('Find user err:', err);
        });

        // console.log('Find user:', res);
        if(res && res.total>0) {
          // Found user
          var user = res.data[0];
          // Generate jwt
          const { accessToken } = await this.app.service('authentication').create({}, {
            payload: { userId: user._id }
          });
          // console.log('accessToken:', accessToken);
          result = {
            found: true,
            access_token: accessToken
          };
          status = 200;
        }
        else {
          // Not found
          result = {
            found: false,
            openid
          };
          status = 200;
        }
      }
      break;
    }

    return [{
      _id: 'the-id',
      status,
      result
    }];
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current)));
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options, app) {
  return new Service(options, app);
};

module.exports.Service = Service;
