const fs = require('fs-extra');
const path = require('path');
const git = require('simple-git/promise');

const assertPathExists = async (basePath, subPath = '') => {
	const targetPath = subPath ? path.join(basePath, subPath) : basePath;

	if (!(await fs.pathExists(targetPath))) {
		throw new Error(`Directory ${targetPath} does not exist!`);
	}

	return targetPath;
};

module.exports.singleton = async () => {
	const packages = [];

	const PackageManager = class {
		constructor() {
			this.get = async packageIdentifier => {
				return (await Promise.all(packages.map(async flowPackage => ({
					composerName: await flowPackage.composerName,
					packageKey: await flowPackage.packageKey,
					flowPackage
				})))).filter(({composerName, packageKey}) => {
					return (composerName === packageIdentifier) || (packageKey === packageIdentifier);
				}).map(({flowPackage}) => flowPackage)[0];
			};
		}

		async initializeObject() {
			const manifest = await this.objectManager.get('manifest');
			const unassertedBaseDirectory = (await this.objectManager.get('context')).rootPath;
			const baseDirectory = await assertPathExists(unassertedBaseDirectory);
			const gitInstance = git(baseDirectory);
			const packagesDirectory = await assertPathExists(baseDirectory, 'Packages');
			const packageTypes = (await fs.readdir(packagesDirectory))
				.filter(d => !['..', '.', 'Libraries'].includes(d));

			await Promise.all(packageTypes.map(async packageType => {
				const packageTypeDirectory = await assertPathExists(packagesDirectory, packageType);
				const packageKeys = (await fs.readdir(packageTypeDirectory))
					.filter(d => !['..', '.'].includes(d));

				return Promise.all(packageKeys.map(async packageKey => {
					// Resolve path to package, also resolve symlinks
					const pathToPackage = await fs.realpath(path.join(packageTypeDirectory, packageKey));
					const pathToComposerJson = path.join(pathToPackage, 'composer.json');
					const packageIsIncluded = (
						manifest.isPackageIncluded(packageKey) &&
						(await fs.pathExists(pathToComposerJson)) &&
						!(await gitInstance.checkIgnore(pathToComposerJson)).length
					);

					if (packageIsIncluded) {
						const pathToPackage = path.join(packageTypeDirectory, packageKey);
						const flowPackage = await this.objectManager.get('flow/package', pathToPackage);

						packages.push(flowPackage);
					}
				}));
			}));
		}

		forEach(...args) {
			packages.forEach(...args);
		}

		map(...args) {
			return packages.map(...args);
		}
	};

	return new PackageManager();
};
