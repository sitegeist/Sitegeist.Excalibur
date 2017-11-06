#!/usr/bin/env node
const logger = require('./src/logger');
const packageJson = require(process.cwd() + '/package.json');
const createObjectManager = require('./framework');

const {argv} = require('yargs')
	.count('verbose')
	.alias('v', 'verbose');

const app = async () => {
	try {
		const objectManager = await createObjectManager({
			rootPath: process.cwd(),
			appPath: __dirname,
			logger,
			argv,
			packageJson,
			npmLifeCycleEvent: process.env.npm_lifecycle_event
		});
		const packageManager = await objectManager.get('flow/packageManager');
		const taskRunner = await objectManager.get('task/runner');
		const manifest = await objectManager.get('manifest');

		await Promise.all(packageManager.map(flowPackage => {
			return taskRunner.run(flowPackage, manifest);
		}));
	} catch (err) {
		console.error(err);
	}
};

app();
