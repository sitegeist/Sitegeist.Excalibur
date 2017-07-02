const executeFlowCommand = require('./execute-flow-command');

module.exports = sitePackageKey => executeFlowCommand('build:printstylesettingsforsitepackage', {
	sitePackageKey
});
