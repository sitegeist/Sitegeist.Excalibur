const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
const fs = require('fs-extra');

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

		return path.split('.').reduce((subConfiguration, pathSegment) => {
			if (subConfiguration) {
				return subConfiguration[pathSegment];
			}

			return null;
		}, manifestConfiguration);
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

		get pathsToCustomizationFiles() {
			return this.objectManager.get('context').then(context => {
				return glob.sync(path.join(context.rootPath, 'excalibur*.js'));
			});
		}
	};

	return new Manifest();
};
