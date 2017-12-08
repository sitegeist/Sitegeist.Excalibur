/* global document */
module.exports = (componentMap, sharedVariables) => {
	const mountComponent = el => {
		const componentIdentifier = el.getAttribute('data-component');
		const initialize = componentMap[componentIdentifier];
		const initializer = initialize && (initialize.default || initialize);

		if (typeof initializer === 'function') {
			const props = el.dataset.props ? JSON.parse(el.dataset.props || '{}') : {};
			initializer(el, props, sharedVariables);
			return;
		}

		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[Sitegeist.Excalibur/Runtime]: Component ${componentIdentifier} could not be found`, el);
		}
	};
	const bootstrap = () => [].slice.call(document.querySelectorAll('[data-component]')).forEach(mountComponent);

	document.addEventListener('DOMContentLoaded', bootstrap);
	document.addEventListener('Neos.PageLoaded', bootstrap);
	document.addEventListener('Neos.NodeCreated', event => {
		if (event.detail.element) {
			const componentCandidates = [].slice.call(event.detail.element.querySelectorAll('[data-component]'))
				.concat(event.detail.element.getAttribute('data-component') === null ? [] : [event.detail.element]);

			componentCandidates.forEach(mountComponent);
		}
	});
};
