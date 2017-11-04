const path = require('path');
const fs = require('fs-extra');

const template = components => `
require('sitegeist-excalibur/JavaScript/runtime')({
${components.map(component => `
	'${component.prototypeName}': require('${component.javascriptFile}')
`)}
});
`.trim();

const generateEntryFileForFlowPackage = async (flowPackage, entryFileName) => {
	const fusionFiles = await flowPackage.fusionFiles;
	const javascriptComponentMap = (await Promise.all(fusionFiles.map(async fusionFile => {
		const [prototypeName, javascriptFile] = await Promise.all([
			await flowPackage.getPrototypeNameFromFusionFilePath(fusionFile),
			await flowPackage.getJavaScriptFileNameFromFusionFilePath(fusionFile)
		]);

		if (await fs.pathExists(path.join(flowPackage.paths.root, javascriptFile))) {
			return {
				prototypeName,
				javascriptFile: path.join(flowPackage.paths.root, javascriptFile)
			};
		}
	}))).filter(i => i);

	await fs.ensureFile(entryFileName);
	await fs.writeFile(entryFileName, template(javascriptComponentMap));
};

module.exports = function (flowPackage, tmpFile) {
	this.apply = compiler => {
		const generate = (_, done) =>
			generateEntryFileForFlowPackage(flowPackage, tmpFile).then(done);

		compiler.plugin('run', generate);
		compiler.plugin('watch-run', generate);
	};
};
