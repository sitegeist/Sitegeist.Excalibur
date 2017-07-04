const path = require('path');
const {spawn} = require('child_process');

module.exports.id = 'test:unit';
module.exports.label = 'Unit Tests';
module.exports.isWatchable = true;

module.exports.run = api => {
	const {flowPackage, logger, error, success, argv} = api;
	const jestExecutable = 'jest';
	const testFilePattern = `^${flowPackage.paths.components.replace(/\//g, '\\/')}.*\\.spec\\.js$`;
	const setupFile = path.join(__dirname, '/helpers.js');
	const update = argv.u || argv.update ? '-u' : '';

	const config = {
		transform: {
			'^.+\\.jsx?$': 'babel-jest'
		},
		rootDir: flowPackage.paths.package
	};

	const command = [
		jestExecutable,
		`--config='${JSON.stringify(config)}'`,
		testFilePattern,
		`--setupTestFrameworkScriptFile=${setupFile}`,
		update
	].join(' ');

	const log = data => {
		data.toString().split('\n')
			.filter(l => l)
			.filter(l => !l.includes(flowPackage.paths.components))
			.map(logger.info);
	};

	console.log('');

	const jestProcess = spawn(command, {
		shell: true,
		env: Object.assign({}, process.env, {FORCE_COLOR: true})
	});

	jestProcess.stdout.on('data', log);
	jestProcess.stderr.on('data', log);

	jestProcess.on('close', code => {
		if (code.toString() !== '0') {
			error(`Test for "${flowPackage.packageKey}" failed :(`);
		}

		success(`Test for "${flowPackage.packageKey}" succeeded :)`);
	});
};
