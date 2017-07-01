/* global document */
module.exports = components => {
	const bootstrap = () => components.forEach(({identifier, initialize}) => {
		[].slice.call(document.querySelectorAll('[data-component="' + identifier + '"]'))
			.forEach(el => {
				const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
				const initializer = initialize.default || initialize;
				initializer(el, props);
			});
	});

	document.addEventListener('DOMContentLoaded', bootstrap);
	document.addEventListener('Neos.PageLoaded', bootstrap);
};
