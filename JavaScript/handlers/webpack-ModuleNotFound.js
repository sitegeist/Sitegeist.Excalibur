const chalk = require('chalk');

module.exports = class {
	matches(error) {
		return error.toString().startsWith('ModuleNotFoundError:');
	}

	print(error) {
		const regex = /ModuleNotFoundError: Module not found: Error: Can't resolve '([\.\-a-zA-Z@]*)' in '(.*)'/g; // eslint-disable-line
		const [, moduleName, fileName] = regex.exec(error.toString());

		return `
			Looks like you are referencing the module "${chalk.bold(moduleName)}", which is not yet installed.
			To install the module, you can run:

				${chalk.bold(`yarn add ${moduleName}`)}

			Or have a look into this module for any other possible reason behind this error:

				${chalk.bold(fileName)}
		`;
	}
};
