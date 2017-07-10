const looksSame = require('looks-same');

module.exports = (reference, subject) => new Promise((resolve, reject) => {
	looksSame(reference, subject, (error, equal) => {
		if (error) {
			return reject(error);
		}

		resolve(equal);
	});
})
