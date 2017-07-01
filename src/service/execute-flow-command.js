const {execSync} = require('child_process');
const paramCase = require('param-case');

const discoverLocalFile = require('./discover-local-file');

module.exports = async (command, options = {}) => {
	const flowExecutable = await discoverLocalFile('flow');

	if (!flowExecutable) {
		throw new Error('Could not find Neos Flow executable.');
	}

	return execSync(`${flowExecutable} ${command} ${Object.keys(options).map(
		key => ` --${paramCase(key)}="${options[key]}"`
	)}`).toString();
};
