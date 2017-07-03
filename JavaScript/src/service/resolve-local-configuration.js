const discoverLocalFile = require('./discover-local-file');

module.exports = async (configurationKey, fallback, expectedType = 'any') => {
	const localConfigurationFile = await discoverLocalFile('excalibur.config.js');

	if (localConfigurationFile) {
		const localConfiguration = require(localConfigurationFile);

		if (localConfiguration[configurationKey]) {
			const configurationType = typeof localConfiguration[configurationKey];

			if (configurationType === expectedType || expectedType === 'any') {
				return localConfiguration[configurationKey];
			}

			throw new Error(`Expected "${expectedType}" for "${configurationKey}" configuration, instead got: "${configurationType}"`);
		}
	}

	return fallback;
};
