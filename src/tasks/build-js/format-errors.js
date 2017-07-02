module.exports = (stats, sitePackageName, logger) => {
	logger.warning(`Found ${stats.compilation.warnings.length} warnings during compilation of "${sitePackageName}"`);
	logger.error(`Found ${stats.compilation.errors.length} errors during compilation of "${sitePackageName}"`);

	console.log('');

	stats.compilation.errors.forEach((error, i) => {
		logger.error(`Error #${i + 1}:`);

		switch (true) {
			case error.toString().startsWith('ModuleNotFoundError:'): // eslint-disable-line
				const regex = /ModuleNotFoundError: Module not found: Error: Can't resolve '([\.\-a-zA-Z@]*)' in '(.*)'/g; // eslint-disable-line
				const [, moduleName, fileName] = regex.exec(error.toString());

				console.log('');
				console.log(`    Looks like you are referencing the module "${moduleName}", which is not yet installed.`);
				console.log(`    To install the module, you can run:`);
				console.log('');
				console.log(`         yarn add ${moduleName}`);
				console.log('');
				console.log(`    Or have a look into this module for any other possible reason behind this error:`);
				console.log('');
				console.log(`        ${fileName}`);
				break;

			default:
				console.log('');
				console.log(error);
		}

		console.log('');
	});

	console.log('');
};
