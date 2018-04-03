// Initializes the `wxauth` service on path `/wxauth`
const createService = require('./wxauth.class.js');
const hooks = require('./wxauth.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'wxauth',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/wxauth', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('wxauth');

  service.hooks(hooks);
};
