const createDefaultConfiguration = options => [
	options.legacySupport ? 'postcss-object-fit-images' : null,
	'autoprefixer',
	{precss: {}},
	{'postcss-map': {maps: [options.cssMapValues]}}
];

module.exports = async ({resolveLocalConfiguration, flowPackage, logger, error}) => {
	const options = {
		legacySupport: false,
		cssMapValues: flowPackage.styleSettings
	};
	const defaultConfiguration = createDefaultConfiguration(options);
	const override = await resolveLocalConfiguration('build:css', {postcss: id => id}, 'object');
	const printError = (...lines) => {
		logger.error('Something seems to be wrong in your custom PostCSS configuration:');

		lines.forEach(line => console.log(line));

		error('Please, check your custom PostCSS configuration in excalibur.config.js');
	};

	return override.postcss(defaultConfiguration).filter(entry => entry !== null).map(entry => { // eslint-disable-line
		if (typeof entry === 'string') {
			try {
				return require(entry);
			} catch (err) {
				printError(
					`The PostCSS plugin "${entry}" does not seem to be installed. Install it via:`,
					'',
					`    yarn add ${entry}`
				);
			}
		}

		if (typeof entry === 'object') {
			const pluginName = Object.keys(entry)[0];

			try {
				const plugin = require(pluginName);
				return plugin(entry[pluginName]);
			} catch (err) {
				printError(
					`The PostCSS plugin "${pluginName}" does not seem to be installed. Install it via:`,
					'',
					`    yarn add ${pluginName}`
				);
			}
		}

		printError(
			'Each entry in you PostCSS configuration is supposed to be either a string or an object.',
			'',
			`Received ${typeof entry} instead.`
		);
	});
};
