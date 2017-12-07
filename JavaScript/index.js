#!/usr/bin/env node
const chalk = require('chalk');
const glob = require('glob');
const path = require('path');
const pad = require('lodash.pad');

const {version} = require('../package.json');
const packageJson = require(process.cwd() + '/package.json');
const createObjectManager = require('./framework');

const {argv} = require('yargs')
	.count('verbose')
	.alias('v', 'verbose');

console.log('');
console.log(chalk.yellow.bgBlack('                                                                                                                        '));
console.log(chalk.yellow.bgBlack('                                                                                                                        '));
console.log(chalk.yellow.bgBlack('                                                 _ _                  _     _                                           '));
console.log(chalk.yellow.bgBlack('                                       _     ___(_) |_ ___  __ _  ___(_)___| |_                                         '));
console.log(chalk.yellow.bgBlack('                                     _| |_  / __| | __/ _ \\/ _` |/ _ \\ / __| __|                                        '));
console.log(chalk.yellow.bgBlack('                                    |_   _| \\__ \\ | ||  __/ (_| |  __/ \\__ \\ |_                                         '));
console.log(chalk.yellow.bgBlack('                                      |_|   |___/_|\\__\\___|\\__, |\\___|_|___/\\__|                                        '));
console.log(chalk.yellow.bgBlack('                                                           |___/                                                        '));
console.log(chalk.yellow.bgBlack('                                                                                                                        '));
console.log(chalk.yellow.bgBlack(pad(`EXCALIBUR ⚔ ${version}`, 120)));
console.log(chalk.yellow.bgBlack('                                                                                                                        '));
console.log(chalk.yellow.bgBlack('                                                                                                                        '));
console.log(chalk.yellow.bgBlack('                                                                                                                        '));

console.log('');

const app = async () => {
	try {
		//
		// Initialize object manager
		//
		const objectManager = await createObjectManager({
			rootPath: process.cwd(),
			appPath: __dirname,
			argv,
			packageJson,
			npmLifeCycleEvent: process.env.npm_lifecycle_event
		});

		//
		// Initialize error handler
		//
		const handlers = glob.sync(path.join(__dirname, 'handlers/**/*.js')).map(require)
			.map(HandlerClass => new HandlerClass());

		await objectManager.get('task/printErrors', handlers);

		//
		// Initialize package manager, task runner and distribution manifest
		//
		const packageManager = await objectManager.get('flow/packageManager');
		const taskRunner = await objectManager.get('task/runner');
		const manifest = await objectManager.get('manifest');

		//
		// Run tasks
		//
		const results = await Promise.all(packageManager.map(flowPackage => {
			return taskRunner.run(flowPackage, manifest);
		}));

		//
		// Calculate final exit code from task results
		//
		process.exit([].concat(...results).some(r => r) ? 1 : 0);
	} catch (err) {
		console.error(err);
	}
};

app();
