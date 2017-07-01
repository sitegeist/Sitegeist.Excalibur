const path = require('path');
const fs = require('fs-extra');

const discoverFlowExecutable = async (fileName, directory = process.cwd()) => {
	if (directory === '/' || !directory) {
		return false;
	}

	const possiblePathToFlowExecutable = path.join(directory, fileName);

	if (await fs.pathExists(possiblePathToFlowExecutable)) {
		return possiblePathToFlowExecutable;
	}

	return discoverFlowExecutable(fileName, directory.split('/').slice(0, -1).join('/'));
};

module.exports = discoverFlowExecutable;
