const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const {$get} = require('plow-js');

module.exports.singleton = () => {
	let pathToManifestFile;
	let manifestConfiguration = null;

	const readManifestFile = path => {
		if (!manifestConfiguration) {
			if (!fs.pathExistsSync(pathToManifestFile)) {
				return;
			}
			const yamlString = fs.readFileSync(pathToManifestFile, 'utf8');
			manifestConfiguration = yaml.safeLoad(yamlString);
		}
		return $get(path, manifestConfiguration);
	};

	const Manifest = class {
		constructor() {
			this.isPackageIncluded = packageKey => !(readManifestFile('ignoredPackages') || [])
				.includes(packageKey);
		}

		async initializeObject() {
			const context = await this.objectManager.get('context');

			pathToManifestFile = path.join(context.rootPath, 'excalibur.yaml');
		}

		get pathToCustomizationFile() {
			return this.objectManager.get('context').then(context => {
				const maybePathToCustomizationFile = path.join(context.rootPath, 'excalibur.js');

				return fs.pathExists(maybePathToCustomizationFile).then(pathExists => {
					if (pathExists) {
						return maybePathToCustomizationFile;
					}
				});
			});
		}
	};

	return new Manifest();
};
