module.exports = class {
	matches(error) {
		return error.toString().trim().startsWith('ModuleBuildError: Module build failed: SyntaxError: Unexpected token');
	}

	print(error) {
		const lines = [];
		const errorLines = error.toString().split('\n');

		for (const errorLine of errorLines) {
			if (errorLine.match(/[0-9] \|/)) {
				lines.push(errorLine);
			}

			if (errorLine.trim().startsWith('at ')) {
				break;
			}
		}

		lines.unshift('');
		lines.unshift('Looks like there\'s a Syntax Error:');

		return lines.join('\n');
	}
};
