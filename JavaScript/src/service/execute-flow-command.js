const {execSync} = require('child_process');
const paramCase = require('param-case');

const discoverLocalFile = require('./discover-local-file');

module.exports = async (logger, error, command, options = {}) => {
	const flowExecutable = await discoverLocalFile('flow');

	if (!flowExecutable) {
		error('Could not find Neos Flow executable.');
	}

	const result = execSync(`${flowExecutable} ${command} ${Object.keys(options).map(
		key => ` --${paramCase(key)}="${options[key]}"`
	)}`).toString();

	return result;
};
