const buildJs = require('../build-js');

module.exports = (api, skipHeader = false) => buildJs(api, true, skipHeader);
