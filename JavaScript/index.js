#!/usr/bin/env node
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));

const packageJson = require(process.cwd() + '/package.json');
const composerJson = require(process.cwd() + '/composer.json');

const logger = require('./src/logger');
const {
	hangInThere,
	resolveLocalConfiguration,
	resolveLookupPaths,
	resolveStyleSettings
} = require('./src/service');

const error = logger => message => {
	console.log('');
	logger.error(message);
	console.log('');
	process.exit(1);
};

const success = logger => message => {
	console.log('');
	logger.success(message);
	console.log('');
};

const router = taskName => {
	const watch = taskName.startsWith('watch:');
	const taskPathName = taskName.replace(/^watch:/, '').replace(/:/g, '-');
	const modulePattern = path.join(__dirname, 'src/tasks', taskPathName + '*');
	const pluginPattern = path.join(process.cwd(), 'node_modules', `sitegeist-excalibur-task-${taskPathName}*`);
	const paths = [...glob.sync(modulePattern), ...glob.sync(pluginPattern)]
		.filter(path => packageJson.scripts[path.split('/').slice(-1)[0].replace(/-/g, ':')]);

	return {paths, watch};
};

const runner = async (paths, watch) => {
	const tasks = paths.map(require).filter(({isWatchable}) => !watch || isWatchable);

	logger.header(tasks.map(({label}) => label).join(', ') + (watch ? ' [WATCH MODE]' : ''));
	logger.info('Loading Neos CMS site packages...');

	if (watch) {
		logger.info('(Tip: If you add another site package, you need to restart this watch task)');
	}

	const sitePackagePaths = glob.sync('Packages/Sites/*');

	if (!sitePackagePaths || !sitePackagePaths.length) {
		logger.warning('Looks like there are no site packages in your distribution. You should come back later ;)');
		process.exit(1);
	}

	await Promise.all(
		sitePackagePaths.map(
			sitePackagePath => {
				const sitePackageName = sitePackagePath.split('/').slice(-1)[0];
				logger.info(`Processing ${sitePackageName}...`);

				return Promise.all(tasks.map(async ({id, run}) => {
					const api = {};

					api.argv = argv;
					api.sitePackageName = sitePackageName;
					api.sitePackagePath = sitePackagePath;
					api.watch = watch;
					api.packageJson = packageJson;
					api.composerJson = composerJson;
					api.lookupPaths = JSON.parse(await resolveLookupPaths(logger, error, sitePackageName));
					api.styleSettings = JSON.parse(await resolveStyleSettings(logger, error, sitePackageName));
					api.logger = logger.create(id);
					api.error = error(api.logger);
					api.success = success(api.logger);
					api.resolveLocalConfiguration = resolveLocalConfiguration;
					api.hangInThere = hangInThere(api);

					return run(api);
				}));
			}
		)
	);
};

const app = async () => {
	const taskName = process.env.npm_lifecycle_event || argv.t || argv.task;
	const {paths, watch} = router(taskName);

	if (!paths.length) {
		console.log(`Could not find Task ${taskName}`);
		require('./src/tasks/help')();
		process.exit(1);
	}

	try {
		await runner(paths, watch);
	} catch (err) {
		console.error(err);
		error(logger)(err.message || err);
	}
};

app();
