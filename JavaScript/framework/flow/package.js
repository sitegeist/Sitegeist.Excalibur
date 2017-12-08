const path = require('path');
const fs = require('fs-extra');
const s = require('string');
const glob = require('glob');
const yaml = require('js-yaml');

const getFileContents = async absolutePathToFile =>
	await fs.pathExists(absolutePathToFile) ? fs.readFile(absolutePathToFile) : '';

/**
 * @module Package
 *
 * An abstraction for a flow package
 */
module.exports = pathToPackage => {
	const fileCache = {};
	const fileAsJsonCache = {};
	const fileAsYamlCache = {};
	const componentNameCache = {};

	const Package = class {
		async initializeObject() {
			const {rootPath} = await this.objectManager.get('context');

			this.paths = {};
			this.paths.root = pathToPackage;
			this.paths.privateResources = path.join(this.paths.root, 'Resources/Private');
			this.paths.publicResources = path.join(this.paths.root, 'Resources/Public');
			this.paths.temporary = path.join(rootPath, 'Data/Temporary/Sitegeist.Excalibur', await this.packageKey);
		}

		/**
		 * Get the composer name of the package
		 *
		 * @return Promise<String>
		 */
		get composerName() {
			return this.getFileContentsAsJson('composer.json').then(composerJson => {
				return composerJson.name;
			});
		}

		/**
		 * Get the package key of the package, as it is used by Neos
		 *
		 * @return Promise<String>
		 */
		get packageKey() {
			return this.getFileContentsAsJson('composer.json').then(composerJson => {
				return composerJson.extra.neos['package-key'];
			});
		}

		/**
		 * Get all paths to all fusion files inside the package
		 *
		 * @return Promise<Array<String>>
		 */
		get fusionFiles() {
			return glob.sync(`${this.paths.privateResources}/Fusion/**/*.{fusion,ts2}`)
				.map(p => s(p).chompLeft(this.paths.root).chompLeft('/').toString());
		}

		/**
		 * Get all configured variables of the package
		 *
		 * @return Promise<object>
		 */
		get variables() {
			return this.getFileContentsAsYaml('excalibur.variables.yaml');
		}

		/**
		 * Get contents of a file inside of the package
		 *
		 * @param String relativePathToFile
		 * @return Promise<String>
		 */
		async getFileContents(relativePathToFile) {
			if (!fileCache[relativePathToFile]) {
				fileCache[relativePathToFile] = await getFileContents(path.join(pathToPackage, relativePathToFile));
			}
			return fileCache[relativePathToFile];
		}

		/**
		 * Get contents of a file inside of the package as parsed JSON
		 *
		 * @param String relativePathToFile
		 * @return Promise<Object>
		 */
		async getFileContentsAsJson(relativePathToFile) {
			if (!fileAsJsonCache[relativePathToFile]) {
				fileAsJsonCache[relativePathToFile] = await this.getFileContents(relativePathToFile)
					.then(contents => JSON.parse(contents));
			}

			return fileAsJsonCache[relativePathToFile];
		}

		/**
		 * Get contents of a file inside of the package as parsed YAML
		 *
		 * @param String relativePathToFile
		 * @return Promise<Object>
		 */
		async getFileContentsAsYaml(relativePathToFile) {
			if (!fileAsYamlCache[relativePathToFile]) {
				fileAsYamlCache[relativePathToFile] = await this.getFileContents(relativePathToFile)
					.then(contents => yaml.safeLoad(contents));
			}

			return fileAsYamlCache[relativePathToFile];
		}

		/**
		 * Get a Fusion prototype name that corresponds to the given fusion file path
		 *
		 * @param String relativePathToFusionFile
		 * @return Promise<String>
		 */
		async getPrototypeNameFromFusionFilePath(relativePathToFusionFile) {
			if (!componentNameCache[relativePathToFusionFile]) {
				if (relativePathToFusionFile === 'Resources/Private/Fusion/Root.fusion') {
					return;
				}

				componentNameCache[relativePathToFusionFile] = `${await this.packageKey}:${
					s(relativePathToFusionFile)
						.chompLeft('Resources/Private/Fusion/')
						.chompLeft('Resources/Private/TypoScript/')
						.chompLeft('Integration/')
						.chompLeft('Presentation/')
						.chompRight('.fusion')
						.chompRight('.ts2')
						.replaceAll('/', '.')
						.splitRight('.', 1)[0]
				}`;
			}

			return componentNameCache[relativePathToFusionFile];
		}

		/**
		 * Get the file name of a colocated JavaScript file that belongs to the given fusion file path
		 *
		 * @param String relativePathToFusionFile
		 * @return String
		 */
		getJavaScriptFileNameFromFusionFilePath(relativePathToFusionFile) {
			return s(relativePathToFusionFile).chompRight('.fusion').chompRight('.ts2').toString().concat('.js');
		}

		/**
		 * Create a file inside the package and get the absolute file path of the created file in return
		 *
		 * @param String fileName
		 * @return String
		 */
		createTemporaryFileName(fileName) {
			return path.join(this.paths.temporary, fileName);
		}
	};

	return new Package();
};
