const glob = require('glob');

module.exports = (header, task) => (api, watch, skipHeader = false) => {
	if (!skipHeader) {
		api.logger.header(header(api, watch));
		api.logger.info('Loading Neos CMS site packages...');

		if (watch) {
			api.logger.info('(Pro Tip: If you add another site package, you need to restart this watch task)');
		}
	}

	const sitePackagePaths = glob.sync('Packages/Sites/*');

	if (!sitePackagePaths || !sitePackagePaths.length) {
		api.logger.warning('Looks like there are no site packages in your distribution. You should come back later ;)');
		return;
	}

	sitePackagePaths.forEach(
		sitePackagePath => {
			const sitePackageName = sitePackagePath.split('/').slice(-1)[0];

			api.logger.info(`Processing ${sitePackageName}...`);
			task(api, watch, sitePackageName, sitePackagePath);
		}
	);
};
