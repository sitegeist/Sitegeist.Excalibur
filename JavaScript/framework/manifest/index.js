const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const minimatch = require('minimatch');

module.exports = (rootPath, ignoreFileName = '.excaliburignore', customizerFilePattern = 'excalibur*.js') => {
	const Manifest = class {
		async initializeObject() {
			this.ignoreFilePatterns = [];

			if (await fs.pathExists(path.join(rootPath, ignoreFileName))) {
				this.ignoreFilePatterns = (await fs.readFile(path.join(rootPath, ignoreFileName), 'utf8'))
					.split('\n')
					.slice(0, -1)
					.map(pattern => path.join(rootPath, pattern));
			}
		}

		ignores(pathToFile) {
			return this.ignoreFilePatterns.some(ignoreFilePattern => minimatch(pathToFile, ignoreFilePattern));
		}

		customize(id, value, dependencies = {}) {
			const CustomizerClasses = glob.sync(path.join(rootPath, customizerFilePattern)).map(require);
			const customizers = CustomizerClasses.map(CustomizerClass => new CustomizerClass());

			return customizers.reduce(
				async (value, customizer) => {
					customizer.logger = await (await this.objectManager.get('logger')).createInstance(id);

					Object.keys(dependencies).forEach(dependency => {
						customizer[dependency] = dependencies[dependency];
					});

					return customizer[id] && customizer.condition !== false ?
						customizer[id](await value) : value;
				},
				Promise.resolve(value)
			);
		}
	};

	return new Manifest();
};
