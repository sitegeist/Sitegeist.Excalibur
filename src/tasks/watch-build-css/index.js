const buildCss = require('../build-css');

module.exports = (api, skipHeader = false) => buildCss(api, true, skipHeader);
