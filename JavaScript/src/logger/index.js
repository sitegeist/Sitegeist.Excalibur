const chalk = require('chalk');
const pad = require('lodash.pad');
const padStart = require('lodash.padstart');
const {version} = require('../../../package.json');

const now = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = padStart(date.getMonth() + 1, 2, '0');
	const day = padStart(date.getUTCDate(), 2, '0');
	const hours = padStart(date.getHours(), 2, '0');
	const minutes = padStart(date.getMinutes(), 2, '0');
	const seconds = padStart(date.getSeconds(), 2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const create = scope => {
	const logger = {};

	logger.message = (symbol, message, color = chalk.white) => {
		const lines = message.match(/.{1,73}/g);
		console.log(`[${symbol}][${pad(scope.substring(0, 11), 11)}]${chalk.white(`[${now()}]`)} ${color(lines[0])}`);

		lines.slice(1).forEach(line => {
			console.log(`${pad('', 46)} ${line}`);
		});
	};

	logger.info = message => logger.message('⏵', message);
	logger.success = message => logger.message('✓', message, chalk.green);
	logger.warning = message => logger.message('⚠', message, chalk.yellow);
	logger.error = message => logger.message('✗', message, chalk.red);

	return logger;
};

const globalLogger = create('excalibur');

module.exports.header = taskLabel => {
	console.log('');
	console.log(chalk.yellow.bgBlack('                                                                                                    '));
	console.log(chalk.yellow.bgBlack('                                       _ _                  _     _                                 '));
	console.log(chalk.yellow.bgBlack('                             _     ___(_) |_ ___  __ _  ___(_)___| |_                               '));
	console.log(chalk.yellow.bgBlack('                           _| |_  / __| | __/ _ \\/ _` |/ _ \\ / __| __|                              '));
	console.log(chalk.yellow.bgBlack('                          |_   _| \\__ \\ | ||  __/ (_| |  __/ \\__ \\ |_                               '));
	console.log(chalk.yellow.bgBlack('                            |_|   |___/_|\\__\\___|\\__, |\\___|_|___/\\__|                              '));
	console.log(chalk.yellow.bgBlack('                                                 |___/                                              '));
	console.log(chalk.yellow.bgBlack('                                                                                                    '));
	console.log(chalk.yellow.bgBlack(pad(`EXCALIBUR ⚔ ${version}`, 100)));
	console.log(chalk.yellow.bgBlack('                                                                                                    '));
	console.log(chalk.yellow.bgBlack(pad(`Task(s): ${taskLabel}`, 100)));
	console.log(chalk.yellow.bgBlack('                                                                                                    '));
	console.log(chalk.yellow.bgBlack('                                                                                                    '));

	console.log('');
};

module.exports.create = create;
module.exports.message = globalLogger.message;
module.exports.info = globalLogger.info;
module.exports.success = globalLogger.success;
module.exports.warning = globalLogger.warning;
module.exports.error = globalLogger.error;
