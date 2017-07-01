const path = require('path');
const fs = require('fs-extra');

module.exports = async (taskName, directory) => {
	if (typeof taskName !== 'string' || !taskName) {
		return false;
	}

	const pathToTask = path.join(directory, taskName.replace(':', '-'));

	if (await fs.pathExists(pathToTask)) {
		return pathToTask;
	}

	return false;
};
