
const chalk = require('chalk');

module.exports = class {
	matches(error) {
		const regexError = /TypeError: Cannot read property '([\.\-a-zA-Z@]*)'/; // eslint-disable-line
		const regexTrace = /postcss-map\/dist\/visitor\.js/;

		return regexError.test(error.toString()) && regexTrace.test(error.stack);
	}

	print(error) {
		const regex = /TypeError: Cannot read property '([\.\-a-zA-Z@]*)'/g; // eslint-disable-line
		const [, propertyName] = regex.exec(error.toString());

		return `
			Seems, you are using a construct like

				${chalk.bold(`map(..., ${propertyName})`)}

			in your CSS, in which ${chalk.bold(`"${propertyName}"`)} is not defined. Sorry, that's all available info :(

			Make sure you have all of your properties used with ${chalk.bold(`map(...)`)} defined in your package's ${chalk.bold(`excalibur.variables.yaml`)}
		`;
	}
};
