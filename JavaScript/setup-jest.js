const createObjectManager = require('./framework');
let objectManager = null;
const get = async (dependency, ...args) => {
	if (!objectManager) {
		objectManager = await createObjectManager({
			rootPath: process.cwd(),
			appPath: __dirname
		});
	}

	return objectManager.get(dependency, ...args);
};

//
// Get HTML string representation of a rendered fusion component
//
global.renderComponent = async prototypeName => {
	const command = await get('flow/command');
	return command.run('sitegeist.monocle:styleguide:render', {prototypeName});
};

//
// Get DOM representation of a rendered fusion component
//
global.renderAndFindComponent = async prototypeName => {
	const html = await global.renderComponent(prototypeName);

	document.body.innerHTML = html;

	return document.querySelector(`[data-component="${prototypeName}"]`);
};

//
// Get DOM representation of a rendered fusion component and initialize the associated
// JavaScript on it
//
global.renderAndInitializeComponent = async (prototypeName, initialize) => {
	const el = await global.renderAndFindComponent(prototypeName);
	const props = JSON.parse(el.getAttribute('data-props'));

	initialize(el, props);

	return {el, props};
};
