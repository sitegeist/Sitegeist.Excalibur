const {execSync} = require('child_process');

module.exports = sitePackageKey => {
	const output = execSync(`./flow build:printlookuppathsforsitepackage ${sitePackageKey}`).toString();
	return JSON.parse(output);
};
