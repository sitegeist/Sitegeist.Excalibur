const looksSame = require('looks-same');

const defaultOptions = {
	highlightColor: '#ff00ff',
	strict: false,
	tolerance: 2.5
};

module.exports = (reference, subject, pathToDiff, options = defaultOptions) => new Promise(
	(resolve, reject) => looksSame.createDiff(
		Object.assign({}, options, {
			reference,
			current: subject,
			diff: pathToDiff
		}),
		error => {
			if (error) {
				return reject(error);
			}

			resolve(pathToDiff);
		}
	)
);
