const fs = require('fs');

module.exports = async (Page, fileName, format = 'png') => {
	const screenshot = await Page.captureScreenshot({format});
	const buffer = new Buffer(screenshot.data, 'base64');

	return new Promise((resolve, reject) => {
		fs.writeFile(fileName, buffer, 'base64', err => {
			if (err) {
				return reject(err);
			}

			resolve(fileName);
		});
	});
};
