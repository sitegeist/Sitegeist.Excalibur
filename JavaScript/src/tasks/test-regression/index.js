const chrome = require('chrome-remote-interface');

const run = require('./run');

module.exports.id = 'test:regression';
module.exports.label = 'Visual Regression Tests';
module.exports.isWatchable = false;

module.exports.run = async api => {
	const {logger, error, success, argv, executeFlowCommand} = api;
	const clientOptions = {
		host: argv['chrome-host'] || '127.0.0.1',
		port: argv['chrome-port'] || '9222'
	};
	const serverOptions = {
		host: argv['flow-host'] || '127.0.0.1',
		port: argv['flow-port'] || '8081',
		endpoint: argv['monocle-endpoint'] || 'sitegeist/monocle/preview/component'
	};
	const handleConnectionError = err => {
		if (err.code === 'ECONNREFUSED') {
			logger.error('Can\'t find chrome.');
			console.log('');

			logger.info('Make sure to run chrome with remote debugging protocal activated:');
			logger.info('');
			logger.info(`    google-chrome --remote-debugging-port=${clientOptions.port}`);

			error('Could not connect to chrome :(');
		} else {
			throw err;
		}
	};

	logger.info('Connecting to chrome...');

	const client = await chrome(clientOptions).catch(handleConnectionError);
	const {DOM, Network, Page} = client;

	await Promise.all([Page.enable(), DOM.enable(), Network.enable()]);

	logger.info('Gathering component data from Sitegeist.Monocle...');

	const components = JSON.parse(await executeFlowCommand('styleguide:items'));

	logger.info('Gathering viewport configuration from Sitegeist.Monocle...');

	const viewports = JSON.parse(await executeFlowCommand('styleguide:viewports'));

	const result = [];

	for (const name of Object.keys(components)) {
		if (argv.only && argv.only !== name) {
			continue;
		}

		const component = Object.assign({}, components[name], {name});
		const options = Object.assign({
			full: true,
			delay: 100,
			skip: false
		}, component.options ? component.options.visualRegressionTesting || {} : {});

		if (options.skip) {
			return null;
		}

		console.log('');
		logger.info(`Navigating to "${component.title}"...`);

		for (const name of Object.keys(viewports)) {
			const viewport = Object.assign({}, viewports[name], {name});
			const runApi = Object.assign({}, api);

			runApi.component = component;
			runApi.options = options;
			runApi.client = client;
			runApi.serverOptions = serverOptions;
			runApi.viewport = viewport;

			result.push(await run(runApi)); // eslint-disable-line
		}
	}

	if (result.filter(n => n !== null).every(n => n === true)) {
		success('Visual regression test successful :)');
		process.exit(0);
	} else {
		console.log('');
		logger.info('Test results: ');
		logger.success(`${result.filter(n => n === true).length || '0'} passed`);
		logger.warning(`${result.filter(n => n === null).length || '0'} skipped`);
		logger.error(`${result.filter(n => n !== true && n !== false).length || '0'} failed`);

		console.log('');
		logger.info('Failed scenarios:');
		result.filter(n => n !== true && n !== false).map(n => logger.info(`    ${n}`));

		error('Visual regression test failed :(');
	}
};
