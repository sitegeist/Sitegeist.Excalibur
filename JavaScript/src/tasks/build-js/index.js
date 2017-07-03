const webpack = require('webpack');

const formatErrors = require('./format-errors');
const createWebpackConfig = require('./create-webpack-config');

module.exports.id = 'build:js';
module.exports.label = 'Build JavaScript';
module.exports.isWatchable = true;

module.exports.run = async api => {
	const {hangInThere, logger, error, success, watch, flowPackage} = api;
	const handleSuccess = watch ? logger.success : success;
	const handleError = watch ? logger.error : error;

	const build = hangInThere((err, stats) => {
		if (err) {
			throw err;
		} else if (stats.hasErrors()) {
			formatErrors(stats, flowPackage.packageKey, logger);
			handleError(`JavaScript build for "${flowPackage.packageKey}" failed :(`);
		} else {
			handleSuccess(`JavaScript for "${flowPackage.packageKey}" successfully built :)`);
		}

		if (watch) {
			logger.info(`Watching "${flowPackage.packageKey}"...`);
		}
	});

	const webpackConfig = await createWebpackConfig(api, flowPackage.packageKey);
	const compiler = webpack(webpackConfig);

	if (watch) {
		logger.info(`Please wait until the initial build for "${flowPackage.packageKey}" is ready.`);
		compiler.watch({}, build);
	} else {
		compiler.run(build);
	}
};
