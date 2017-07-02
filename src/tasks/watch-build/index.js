const allowedTasks = {
	'watch:build:css': require('../watch-build-css'),
	'watch:build:js': require('../watch-build-js')
};

module.exports = api => {
	api.logger.header('Watch build');

	Object.keys(allowedTasks).filter(taskName => api.packageJson.scripts[taskName]).forEach(
		taskName => allowedTasks[taskName](api, true)
	);
};
