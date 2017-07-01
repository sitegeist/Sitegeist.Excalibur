const executeFlowCommand = require('./execute-flow-command');

module.exports = sitePackageKey => executeFlowCommand('build:printlookuppathsforsitepackage', {
	sitePackageKey
});
