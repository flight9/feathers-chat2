const assert = require('assert');
const app = require('../../src/app');

describe('\'wxauth\' service', () => {
  it('registered the service', () => {
    const service = app.service('wxauth');

    assert.ok(service, 'Registered the service');
  });
});
