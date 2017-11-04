const path = require('path');
const glob = require('glob');

module.exports.singleton = () => {
	const Runner = class {
		constructor() {
			this.run = async (flowPackage, manifest) => {
				const method = this.isWatchMode ? 'watch' : 'run';
				await Promise.all(this.tasks.map(task => task.configure(flowPackage, manifest)));
				await Promise.all(this.tasks.filter(task => !this.isWatchMode || task.isWatchable).map(task => task[method]()));
			};
		}

		async initializeObject() {
			const {npmLifeCycleEvent, packageJson, appPath} = await this.objectManager.get('context');
			const taskPathName = npmLifeCycleEvent.replace(/^watch:/, '').replace(/:/g, '-');
			const modulePattern = path.join(appPath, 'tasks', taskPathName + '*');
			const paths = glob.sync(modulePattern)
				.filter(path => packageJson.scripts[path.split('/').slice(-1)[0].replace(/-/g, ':')]);

			this.isWatchMode = npmLifeCycleEvent.startsWith('watch:');
			this.tasks = await Promise.all(paths.map(require).map(TaskClass => {
				return this.objectManager.get('task/task', TaskClass);
			}));
		}
	};

	return new Runner();
};
