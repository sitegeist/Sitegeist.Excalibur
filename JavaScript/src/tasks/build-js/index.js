const webpack = require('webpack');

const formatErrors = require('./format-errors');
const createWebpackConfig = require('./create-webpack-config');

module.exports.id = 'build:js';
module.exports.label = 'Build JavaScript';
module.exports.isWatchable = true;

module.exports.run = async api => {
	const {hangInThere, logger, error, success, watch, sitePackageName} = api;
	const handleSuccess = watch ? logger.success : success;
	const handleError = watch ? logger.error : error;

	const build = hangInThere((err, stats) => {
		if (err) {
			throw err;
		} else if (stats.hasErrors()) {
			formatErrors(stats, sitePackageName, logger);
			handleError(`JavaScript build for "${sitePackageName}" failed :(`);
		} else {
			handleSuccess(`JavaScript for "${sitePackageName}" successfully built :)`);
		}

		if (watch) {
			logger.info(`Watching "${sitePackageName}"...`);
		}
	});

	const webpackConfig = await createWebpackConfig(api, sitePackageName);
	const compiler = webpack(webpackConfig);

	if (watch) {
		logger.info(`Please wait until the initial build for "${sitePackageName}" is ready.`);
		compiler.watch({}, build);
	} else {
		compiler.run(build);
	}
};