const path = require('path');
const fs = require('fs-extra');

const allowedComponentFiles = [
	'Component.js',
	'component.js',
	'Index.js',
	'index.js'
];

const template = components => `
require('sitegeist-excalibur/runtime')({
${components.map(component => `
	'${component.identifier}': require('${component.path}')
`)}
});
`.trim();

const generateEntryFile = async (filePath, components) => {
	await fs.ensureFile(filePath);
	await fs.writeFile(filePath, template(components.map(
		component => ({
			identifier: allowedComponentFiles.reduce(
				(identifier, fileName) => identifier.split(`/${fileName}`)[0],
				component.split('Resources/Private/Fusion/')[1]
			),
			path: component
		})
	)));
};

const generateEntryFileForSitePackage = async (sitePackageName, lookupPaths, tmpFile) => {
	const components = lookupPaths.reduce((lookupPaths, currentPath) => [
		...lookupPaths,
		...allowedComponentFiles.map(
			fileName => path.join(currentPath, fileName)
		)
	], [])
	.filter(filePath => fs.pathExistsSync(filePath));

	await generateEntryFile(tmpFile, components);
};

module.exports = function (sitePackageName, resolveLookupPaths, tmpFile) {
	this.apply = compiler => {
		const generate = (_, done) =>
			generateEntryFileForSitePackage(sitePackageName, resolveLookupPaths, tmpFile).then(done);

		compiler.plugin('run', generate);
		compiler.plugin('watch-run', generate);
	};
};
