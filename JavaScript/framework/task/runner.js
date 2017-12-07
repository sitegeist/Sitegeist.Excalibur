const path = require('path');
const glob = require('glob');

module.exports.singleton = () => {
	const Runner = class {
		constructor() {
			this.run = async (flowPackage, manifest) => {
				const method = this.isWatchMode ? 'watch' : 'run';
				const tasks = await Promise.all(this.paths.map(require).map(async TaskClass => {
					const task = await this.objectManager.get('task/task', TaskClass, this, flowPackage, manifest);
					const customizeConfiguration = async scope => {
						const {id, configuration} = task.instance;
						const customizer = await this.objectManager.get('task/customizer', {
							id,
							scope,
							configuration,
							flowPackage,
							manifest
						});

						task.instance.configuration = await customizer.run();
					};

					await task.configure();
					await customizeConfiguration(flowPackage);
					await customizeConfiguration(manifest);
					await customizeConfiguration(this);

					const {logger, configuration} = task.instance;

					logger.debug(`Using configuration: ${JSON.stringify(configuration, null, 4)}`, 3);

					await task.prepare();

					return task;
				}));

				return Promise.all(
					tasks.filter(task => !this.isWatchMode || task.isWatchable)
						.map(task => task[method]())
				);
			};
		}

		async initializeObject() {
			const {npmLifeCycleEvent, packageJson, appPath} = await this.objectManager.get('context');
			const taskPathName = npmLifeCycleEvent.replace(/^watch:/, '').replace(/:/g, '-');
			const modulePattern = path.join(appPath, 'tasks', taskPathName + '*');

			this.paths = glob.sync(modulePattern)
				.filter(path => packageJson.scripts[path.split('/').slice(-1)[0].replace(/-/g, ':')]);

			this.isWatchMode = npmLifeCycleEvent.startsWith('watch:');
		}

		get pathsToCustomizationFiles() {
			return glob.sync(path.join(__dirname, '../../modifier/**/*.js'));
		}
	};

	return new Runner();
};
