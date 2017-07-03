const path = require('path');
const fs = require('fs-extra');

const template = components => `
require('sitegeist-excalibur/JavaScript/runtime')({
${components.map(component => `
	'${component.identifier}': require('${component.path}')
`)}
});
`.trim();

const generateEntryFile = async (filePath, components) => {
	await fs.ensureFile(filePath);
	await fs.writeFile(filePath, template(components));
};

const generateEntryFileForFlowPackage = async (flowPackage, tmpFile) => {
	const components = Object.values(flowPackage.components).reduce((paths, component) => [
		...paths,
		...component.javascriptLookupPaths.map(lookupPath => ({
			identifier: component.prototypeName,
			path: path.join(flowPackage.paths.components, lookupPath)
		}))
	], [])
	.filter(component => fs.pathExistsSync(component.path));

	await generateEntryFile(tmpFile, components);
};

module.exports = function (flowPackage, tmpFile) {
	this.apply = compiler => {
		const generate = (_, done) =>
			generateEntryFileForFlowPackage(flowPackage, tmpFile).then(done);

		compiler.plugin('run', generate);
		compiler.plugin('watch-run', generate);
	};
};
