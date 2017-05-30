const {execSync} = require('child_process');
const yaml = require('node-yaml');

module.exports = sitePackageKey => {
	const output = execSync(`./flow configuration:show --type Settings --path ${sitePackageKey}.styles`).toString();
	return yaml.parse(output.split('\n').slice(1).join('\n'));
};
