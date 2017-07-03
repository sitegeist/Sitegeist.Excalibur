const fs = require('fs-extra');

const template = components => `
require('sitegeist-excalibur/runtime')([
${components.map(component => `
	{
		identifier: '${component.identifier}',
		initialize: require('${component.path}')
	},
`)}
]);
`;

module.exports = async (filePath, components) => {
	await fs.ensureFile(filePath);
	await fs.writeFile(filePath, template(components.map(
		component => ({
			identifier: component.split('Resources/Private/Fusion/')[1]
				.split('/Component.js')[0]
				.split('/component.js')[0]
				.split('/Index.js')[0]
				.split('/index.js')[0],
			path: component
		})
	)));
};
