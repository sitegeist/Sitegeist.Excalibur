const browserslist = require('browserslist');

module.exports.singleton = () => {
	const browsers = browserslist();
	const Browsers = class {
		async initializeObject() {
			this.logger = await (await this.objectManager.get('logger')).createInstance('browsers');
		}

		compare(query) {
			const browsersToCompareWith = browserslist(query);
			const result = browsersToCompareWith.some(browser => browsers.includes(browser));

			if (result) {
				this.logger.debug(`${query} matches`, 2);
			}

			return result;
		}
	};

	return new Browsers();
};
