const browserslist = require('browserslist');

module.exports.singleton = () => {
	const browsers = browserslist();
	const Browsers = class {
		compare(query) {
			const browsersToCompareWith = browserslist(query);

			return browsersToCompareWith.some(browser => browsers.includes(browser));
		}
	};

	return new Browsers();
};
