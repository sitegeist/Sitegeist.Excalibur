const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const {$get} = require('plow-js');

module.exports.singleton = () => {
	let pathToManifestFile;
	let pathToLockFile;

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

	let lockConfiguration = null;
	const readLockFile = handlerFn => {
		if (!lockConfiguration) {
			if (!fs.pathExistsSync(pathToLockFile)) {
				return;
			}
			const yamlString = fs.readFileSync(pathToLockFile, 'utf8');
			lockConfiguration = yaml.safeLoad(yamlString);
		}
		return handlerFn(lockConfiguration);
	};

	const writeLockFile = configuration => {
		if (!fs.pathExistsSync(pathToLockFile)) {
			return;
		}
		const yamlString = yaml.safeDump(configuration);
		lockConfiguration = configuration;
		return fs.writeFileSync(pathToLockFile, yamlString);
	};

	const Manifest = class {
		constructor() {
			this.isPackageIncluded = packageKey => !(readManifestFile('ignoredPackages') || [])
				.includes(packageKey);

			this.customize = async (configuration, scope) => {
				console.log('TODO: Apply distribution customization.', {
					scope
				});

				return configuration;
			};
		}

		async initializeObject() {
			const context = await this.objectManager.get('context');

			pathToManifestFile = path.join(context.rootPath, 'excalibur.yaml');
			pathToLockFile = path.join(context.rootPath, 'excalibur.lock');
		}
	};

	return new Manifest();
};
