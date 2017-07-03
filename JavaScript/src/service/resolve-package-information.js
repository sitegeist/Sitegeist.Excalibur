const executeFlowCommand = require('./execute-flow-command');

module.exports = async (logger, error, sitePackageKey) => JSON.parse(
	await executeFlowCommand(logger, error, 'build:printpackageinformation', {
		sitePackageKey
	})
);
