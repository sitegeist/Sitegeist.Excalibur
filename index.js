#!/usr/bin/env node
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const packageJson = require(process.cwd() + '/package.json');
const composerJson = require(process.cwd() + '/composer.json');

const logger = require('./src/logger');
const {discoverTask, resolveLocalConfiguration, resolveLookupPaths} = require('./src/service');

const runner = async () => {
	const taskName = process.env.npm_lifecycle_event || argv.t || argv.task;
	const pathToTask = await discoverTask(taskName, path.join(__dirname, 'src/tasks'));

	if (!pathToTask) {
		console.log(`Could not find Task ${taskName}`);
	}

	const task = require(pathToTask || './src/tasks/help');

	try {
		await task({
			taskName,
			packageJson,
			composerJson,
			argv,
			discoverTask,
			resolveLocalConfiguration,
			resolveLookupPaths,
			logger
		});
	} catch (err) {
		console.error(err);
		console.error(`Task ${taskName} failed :(`);
		process.exit(1);
	}
};

runner();
