const Verifier = require('@feathersjs/authentication-oauth2').Verifier;
const Debug = require('debug');
const debug = Debug('@feathersjs/authentication-oauth2:verify');

class WechatVerifier extends Verifier {
  verify(req, accessToken, refreshToken, profile, expiresIn, done) {
    debug('Checking credentials');
    const options = this.options;
    const query = {
      [options.idField]: profile.openid, // should be openid: profile.openid
      $limit: 1
    };
    const data = { profile, accessToken, refreshToken };
    let existing;

    if (this.service.id === null || this.service.id === undefined) {
      debug('failed: the service.id was not set');
      return done(new Error('the `id` property must be set on the entity service for authentication'));
    }

    // Check request object for an existing entity
    if (req && req[options.entity]) {
      existing = req[options.entity];
    }

    // Check the request that came from a hook for an existing entity
    if (!existing && req && req.params && req.params[options.entity]) {
      existing = req.params[options.entity];
    }

    // If there is already an entity on the request object (ie. they are
    // already authenticated) attach the profile to the existing entity
    // because they are likely "linking" social accounts/profiles.
    if (existing) {
      return this._updateEntity(existing, data)
        .then(entity => done(null, entity))
        .catch(error => error ? done(error) : done(null, error));
    }

    // Find or create the user since they could have signed up via facebook.
    this.service
      .find({ query })
      .then(this._normalizeResult)
      .then(entity => entity ? this._updateEntity(entity, data) : this._createEntity(data))
      .then(entity => {
        const id = entity[this.service.id];
        const payload = { [`${this.options.entity}Id`]: id };
        done(null, entity, payload);
      })
      .catch(error => error ? done(error) : done(null, error));
  }

  _updateEntity (entity, data) {
    const options = this.options;
    const name = options.name;
    const id = entity[this.service.id];
    debug(`Updating ${options.entity}: ${id}`);

    const newData = {
      [options.idField]: data.profile.openid, // should be openid: data.profile.openid
      [name]: data.profile  // we only need profile
    };

    return this.service.patch(id, newData, { oauth: { provider: name } });
  }

  _createEntity (data) {
    const options = this.options;
    const name = options.name;
    const tempName = data.profile.openid.substr(0, 16);
    const entity = {
      email: tempName + '@wechat.cn',
      password: 'createbywechat',
      display_name: tempName + '@wechat.cn',
      bind_status: 'createdByOauth',
      [options.idField]: data.profile.openid, // should be openid: data.profile.openid
      [name]: data.profile  // we only need profile
    };

    const id = entity[options.idField];   // this id is only for log
    debug(`Creating new ${options.entity} with ${options.idField}: ${id}`);

    return this.service.create(entity, { oauth: { provider: name } });
  }
}

module.exports = WechatVerifier;
