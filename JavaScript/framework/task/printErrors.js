module.exports.singleton = (errorHandlers = []) => {
	const PrintErrors = class {
		print(errors, logger) {
			errors.forEach((error, index) => {
				const [errorHandler] = errorHandlers.filter(errorHandler => errorHandler.matches(error));

				console.log();
				logger.error(`Error #${index + 1}`);

				if (errorHandler) {
					const lines = errorHandler.print(error).split('\n').filter(l => l.trim());
					const offset = lines[0].length - lines[0].trim().trimLeft().length;

					console.log();
					lines.forEach(line => {
						console.error(`    ${line.substring(offset)}`);
					});
					console.log();
				} else {
					console.error('Unknown error occurred:');
					console.error({error});
				}

				console.log();
			});
		}
	};

	return new PrintErrors();
};
