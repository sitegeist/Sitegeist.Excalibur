const path = require('path');
const fs = require('fs-extra');

const printAvailableTasks = async pad => {
	const tasks = await fs.readdir(
		path.join(__dirname, '..')
	);

	return tasks.map(task => pad + task.replace(/-/g, ':')).join('\n');
};

module.exports = async ({logger, taskName}) => {
	logger.header('Help');
	console.log(`
    Usage via package.json:

        {
            "scripts": {
                "${taskName || 'build:js'}": "sitegeist-excalibur"
            }
        }

    Usage via commandline:

        sitegeist-excalibur --task build:js

    Available Tasks:

${await printAvailableTasks('        ')}
	`);
};
