const {$add, $unshift} = require('plow-js');

module.exports = class {
	get condition() {
		return this.browsers('IE <= 11, Edge <= 15');
	}

	apply() {
		this.on('build:css:postcss', configuration => {
			configuration.append(
				'excalibur/object-fit-polyfill',
				$add('plugins', require('postcss-object-fit-images'))
			);
		});

		this.on('build:js:webpack', configuration => {
			configuration.append(
				'excalibur/object-fit-polyfill',
				$unshift('entry.main', 'sitegeist-excalibur/JavaScript/polyfills/object-fit')
			);
		});
	}
};
