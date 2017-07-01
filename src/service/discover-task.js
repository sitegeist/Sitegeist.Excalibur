const path = require('path');
const fs = require('fs-extra');

module.exports = async (taskName, directory) => {
	if (typeof taskName !== 'string' || !taskName) {
		return false;
	}

	const possiblePathToTask = path.join(directory, taskName.replace(/:/g, '-'));

	if (await fs.pathExists(possiblePathToTask)) {
		try {
			require.resolve(possiblePathToTask);
			return possiblePathToTask;
		} catch (err) {
		}
	}

	const possibleModuleName = `sitegeist-excalibur-task-${taskName}`;

	try {
		require.resolve(possibleModuleName);
		return possibleModuleName;
	} catch (err) {
	}

	return false;
};
