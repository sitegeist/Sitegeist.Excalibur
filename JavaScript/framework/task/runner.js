const path = require('path');
const glob = require('glob');

module.exports = flowPackage => {
	const Runner = class {
		constructor() {
			this.run = () => {
				const method = this.isWatchMode ? 'watch' : 'run';
				return Promise.all(this.paths.map(require).map(async TaskClass => {
					const task = await this.objectManager.get('task/task', TaskClass, this, flowPackage, [
						this.packageManifest,
						this.distributionManifest,
						this.excaliburManifest
					]);

					if (!this.isWatchMode || task.isWatchable) {
						if (!this.isWatchMode && process.env.NODE_ENV !== 'production') {
							this.hangInThere.start();
						}

						await task.configure();
						await task.prepare();
						await task[method]();

						if (!this.isWatchMode && process.env.NODE_ENV !== 'production') {
							this.hangInThere.stop();
						}

						if (this.isWatchMode) {
							return new Promise(() => {});
						}
					}
				}));
			};
		}

		async initializeObject() {
			const {npmLifeCycleEvent, packageJson, appPath, rootPath} = await this.objectManager.get('context');
			const taskPathName = npmLifeCycleEvent.replace(/^watch:/, '').replace(/:/g, '-');
			const modulePattern = path.join(appPath, 'tasks', taskPathName + '*');

			this.paths = glob.sync(modulePattern)
				.filter(path => packageJson.scripts[path.split('/').slice(-1)[0].replace(/-/g, ':')]);

			this.isWatchMode = npmLifeCycleEvent.startsWith('watch:');

			this.packageManifest = await this.objectManager.get('manifest', flowPackage.paths.root);
			this.distributionManifest = await this.objectManager.get('manifest', rootPath);
			this.excaliburManifest = await this.objectManager.get('manifest', appPath, '', 'modifier/**/*.js');

			this.hangInThere = await this.objectManager.get('logger/hangInThere');
		}
	};

	return new Runner();
};
