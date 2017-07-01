const webpack = require('webpack');

const formatErrors = require('./format-errors');
const createWebpackConfig = require('./create-webpack-config');

module.exports = ({resolveLocalConfiguration, resolveLookupPaths, argv, logger, watch}) => async sitePackageName => {
	logger.info(`Processing ${sitePackageName}...`);

	const hangInThereInterval = setInterval(logger.hangin, 7000);

	const build = (err, stats) => {
		clearInterval(hangInThereInterval);
		if (err) {
			throw err;
		} else if (stats.hasErrors()) {
			formatErrors(stats, logger);
		} else {
			logger.success(`JavaScript for ${sitePackageName} successfully built :)`);
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
