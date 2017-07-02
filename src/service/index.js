const discoverTask = require('./discover-task');
const executeFlowCommand = require('./execute-flow-command');
const resolveLocalConfiguration = require('./resolve-local-configuration');
const resolveLookupPaths = require('./resolve-lookup-paths');
const resolveStyleSettings = require('./resolve-style-settings');

module.exports = {
	discoverTask,
	executeFlowCommand,
	resolveLocalConfiguration,
	resolveLookupPaths,
	resolveStyleSettings
};
