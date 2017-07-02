module.exports = api => func => {
	const hangInThereInterval = setInterval(api.logger.hangin, 7000);

	return (...args) => {
		clearInterval(hangInThereInterval);
		func(...args);
	};
};
