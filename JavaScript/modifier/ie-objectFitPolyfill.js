const addOrUnshift = (subject, value) =>
	Array.isArray(subject) ? [value, ...subject] : [value, subject];

module.exports = class {
	get condition() {
		return this.browsers.compare('IE <= 11, Edge <= 15');
	}

	[`build:css`](configuration) {
		this.logger.debug(`Add object-fit polyfill`, 1);
		configuration.postcss.plugins.push(require('postcss-object-fit-images'));

		return configuration;
	}

	[`build:js`](configuration) {
		const polyfillPackageName = 'sitegeist-excalibur/JavaScript/polyfills/object-fit';

		this.logger.debug(`Add object-fit polyfill`, 1);

		if (configuration.webpack.entry.vendor) {
			configuration.webpack.entry.vendor = addOrUnshift(
				configuration.webpack.entry.vendor,
				polyfillPackageName
			);
		} else {
			Object.keys(configuration.webpack.entry).forEach(key => {
				configuration.webpack.entry[key] = addOrUnshift(
					configuration.webpack.entry[key],
					polyfillPackageName
				);
			});
		}

		return configuration;
	}
};
