const executeFlowCommand = require('./execute-flow-command');

module.exports = async (logger, error) => JSON.parse(
	await executeFlowCommand(logger, error, 'build:printpackageinformation')
);
