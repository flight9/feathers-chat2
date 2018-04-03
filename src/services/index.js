const messages = require('./messages/messages.service.js');
const users = require('./users/users.service.js');
const wxauth = require('./wxauth/wxauth.service.js');
module.exports = function (app) {
  app.configure(messages);
  app.configure(users);
  app.configure(wxauth);
};
