const webpack = require('webpack');

const createSitePackageTask = require('../create-site-package-task');
const formatErrors = require('./format-errors');
const createWebpackConfig = require('./create-webpack-config');

module.exports = createSitePackageTask(
	//
	// Header depends on whether the user is watching
	//
	(_, watch) => watch ? 'Watch JavaScript Build' : 'Build JavaScript',

	//
	// Build the site package JavaScript
	//
	async ({resolveLocalConfiguration, resolveLookupPaths, argv, logger, error, success}, watch, sitePackageName) => {
		const hangInThereInterval = setInterval(logger.hangin, 7000);
		const handleSuccess = watch ? logger.success : success;
		const handleError = watch ? logger.error : error;

		const build = (err, stats) => {
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

		const webpackConfig = await createWebpackConfig(
			{
				resolveLocalConfiguration,
				resolveLookupPaths,
				argv
			},
			sitePackageName
		);
		const compiler = webpack(webpackConfig);

		if (watch) {
			compiler.watch({}, build);
		} else {
			compiler.run(build);
		}
	}
);
