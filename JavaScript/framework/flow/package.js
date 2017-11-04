const path = require('path');
const fs = require('fs-extra');
const s = require('string');
const glob = require('glob');
const yaml = require('js-yaml');

module.exports = pathToPackage => {
	const fileCache = {};
	const fileAsJsonCache = {};
	const fileAsYamlCache = {};
	const componentNameCache = {};

	const getFileContents = async relativePathToFile => {
		const absolutePathToFile = path.join(pathToPackage, relativePathToFile);

		if (!(await fs.pathExists(absolutePathToFile))) {
			return '';
		}

		return fs.readFile(absolutePathToFile);
	};

	const Package = class {
		constructor() {
			this.getFileContents = async relativePathToFile => {
				if (!fileCache[relativePathToFile]) {
					fileCache[relativePathToFile] = getFileContents(relativePathToFile);
				}
				return fileCache[relativePathToFile];
			};

			this.getFileContentsAsJson = async relativePathToFile => {
				if (!fileAsJsonCache[relativePathToFile]) {
					fileAsJsonCache[relativePathToFile] = await this.getFileContents(relativePathToFile)
						.then(contents => JSON.parse(contents));
				}

				return fileAsJsonCache[relativePathToFile];
			};

			this.getFileContentsAsYaml = async relativePathToFile => {
				if (!fileAsYamlCache[relativePathToFile]) {
					fileAsYamlCache[relativePathToFile] = await this.getFileContents(relativePathToFile)
						.then(contents => yaml.safeLoad(contents));
				}

				return fileAsYamlCache[relativePathToFile];
			};

			this.getPrototypeNameFromFusionFilePath = async relativePathToFusionFile => {
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
			};

			this.getJavaScriptFileNameFromFusionFilePath = async relativePathToFusionFile => {
				return s(relativePathToFusionFile)
					.chompRight('.fusion')
					.chompRight('.ts2')
					.toString()
					.concat('.js');
			};

			this.createTemporaryFileName = fileName => {
				return path.join(this.paths.temporary, fileName);
			};

			this.customize = async (configuration, scope) => {
				console.log('TODO: Apply package customization.', {
					scope
				});

				return configuration;
			};
		}

		async initializeObject() {
			const {rootPath} = await this.objectManager.get('context');

			this.paths = {};
			this.paths.root = pathToPackage;
			this.paths.privateResources = path.join(this.paths.root, 'Resources/Private');
			this.paths.publicResources = path.join(this.paths.root, 'Resources/Public');
			this.paths.temporary = path.join(rootPath, 'Data/Temporary/Sitegeist.Excalibur', await this.packageKey);
		}

		get composerName() {
			return this.getFileContentsAsJson('composer.json').then(composerJson => {
				return composerJson.name;
			});
		}

		get packageKey() {
			return this.getFileContentsAsJson('composer.json').then(composerJson => {
				return composerJson.extra.neos['package-key'];
			});
		}

		get fusionFiles() {
			return glob.sync(`${this.paths.privateResources}/Fusion/**/*.{fusion,ts2}`)
				.map(p => s(p).chompLeft(this.paths.root).chompLeft('/').toString());
		}

		get settings() {
			return this.getFileContentsAsYaml('excalibur.styles.yaml');
		}
	};

	return new Package();
};
