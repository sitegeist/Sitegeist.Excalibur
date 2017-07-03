const executeFlowCommand = require('./execute-flow-command');

module.exports = (logger, error, sitePackageKey) =>
	executeFlowCommand(logger, error, 'build:printstylesettingsforsitepackage', {
		sitePackageKey
	});
