var portscanner = require('portscanner'),
    settings = require('./settings');

module.exports = {
  is_open: function(host, port, result) {
    portscanner.checkPortStatus(port, host, result);
  }
};
