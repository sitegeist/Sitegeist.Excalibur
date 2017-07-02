const webpack = require('webpack');

const formatErrors = require('./format-errors');
const createWebpackConfig = require('./create-webpack-config');

module.exports = ({resolveLocalConfiguration, resolveLookupPaths, argv, logger, watch, error, success}) => async sitePackageName => {
	logger.info(`Processing ${sitePackageName}...`);

	const hangInThereInterval = setInterval(logger.hangin, 7000);

	const build = (err, stats) => {
		const handleSuccess = watch ? logger.success : success;
		const handleError = watch ? logger.error : error;

		clearInterval(hangInThereInterval);

		if (watch) {
			logger.info(`Watching "${sitePackageName}"...`);
		}

		if (err) {
			throw err;
		} else if (stats.hasErrors()) {
			formatErrors(stats, sitePackageName, logger);
			handleError(`JavaScript build for "${sitePackageName}" failed :(`);
		} else {
			handleSuccess(`JavaScript for "${sitePackageName}" successfully built :)`);
		}
	};

	const webpackConfig = await createWebpackConfig({resolveLocalConfiguration, resolveLookupPaths, argv}, sitePackageName);
	const compiler = webpack(webpackConfig);

	if (watch) {
		compiler.watch({}, build);
	} else {
		compiler.run(build);
	}
};
