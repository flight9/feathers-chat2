const app = require('../../app');

/* eslint-disable no-unused-vars */
class Service {
  constructor (options, app) {
    this.options = options || {};
    this.app = app || {};
  }

  async find (params) {
    // console.log('Authentication:', this.app.service('authentication'));
    var res = await this.app.service('authentication').create({
      strategy: 'local',
      email: 'ealeaf@sohu.com',
      password: 'wrongpass'
    });
    console.log('res', res);

    // call the wechat api
    // var callbackURL = 'http://7ns9nm.natappfree.cc';
    // var url = oauthApi.getAuthorizeURL(callbackURL,'state','snsapi_userinfo');
    // console.log(`params are:`, params);
    //
    // switch (params.query.type) {
    //   case 'code':
    //     break;
    // }

    return [{
      _id: 'url',
      url: '123'
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
