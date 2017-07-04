const executeFlowCommand = require('../../service/execute-flow-command');

global.renderComponent = prototypeName => {
	return executeFlowCommand(null, null, 'styleguide:render', {prototypeName});
};

global.renderAndFindComponent = async prototypeName => {
	document.body.innerHTML = await executeFlowCommand(null, null, 'styleguide:render', {prototypeName});
	return document.querySelector(`[data-component="${prototypeName}"]`);
};

global.renderAndInitializeComponent = async (prototypeName, initialize) => {
	document.body.innerHTML = await executeFlowCommand(null, null, 'styleguide:render', {prototypeName});
	const el = document.querySelector(`[data-component="${prototypeName}"]`);
	const props = JSON.parse(el.getAttribute('data-props'));

	initialize(el, props);

	return {el, props};
};

global.simulateEvent = (el, eventName, options = {}) => {
	el.dispatchEvent(
		new CustomEvent(eventName, options)
	);
};
