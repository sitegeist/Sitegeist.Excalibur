module.exports.singleton = (errorMatchers = []) => {
	const Runner = class {
		handleErrors(errors, logger) {
			errors.forEach((error, index) => {
				const [errorMatcher] = errorMatchers.filter(errorMatcher => errorMatcher.matches(error));

				console.log();
				logger.error(`Error #${index + 1}`);

				if (errorMatcher) {
					const lines = errorMatcher.print(error).split('\n').filter(l => l.trim());
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

	return new Runner();
};
