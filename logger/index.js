const chalk = require('chalk');
const {version} = require('../package.json');

const now = () => {
	const date = new Date();

	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

module.exports.header = () => {
	console.log('');
	console.log(chalk.yellow.bgBlack('                                                                         '));
	console.log(chalk.yellow.bgBlack('                  _ _                  _     _                           '));
	console.log(chalk.yellow.bgBlack('        _     ___(_) |_ ___  __ _  ___(_)___| |_                         '));
	console.log(chalk.yellow.bgBlack('      _| |_  / __| | __/ _ \\/ _` |/ _ \\ / __| __|                        '));
	console.log(chalk.yellow.bgBlack('     |_   _| \\__ \\ | ||  __/ (_| |  __/ \\__ \\ |_                         '));
	console.log(chalk.yellow.bgBlack('       |_|   |___/_|\\__\\___|\\__, |\\___|_|___/\\__|                        '));
	console.log(chalk.yellow.bgBlack('                            |___/                                        '));
	console.log(chalk.yellow.bgBlack('                                                                         '));
	console.log(chalk.yellow.bgBlack(`                                    Neos Build Essentials ${version}          `));
	console.log(chalk.yellow.bgBlack('                                                                         '));

	console.log('');
};

module.exports.message = (message, color = chalk.white) =>
	console.log(`${chalk.white(`[${now()}]`)} ${color(message)}`);

module.exports.exit = (message, exitCode = 0) => {
	console.log(`${chalk.white(`[EXIT: ${now()}]`)} ${(exitCode === 0 ? chalk.green : chalk.red)(message)}`);
	console.log('');
	process.exit(exitCode); // eslint-disable-line unicorn/no-process-exit
};
