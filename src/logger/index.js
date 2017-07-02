const chalk = require('chalk');
const padEnd = require('lodash.padend');
const padStart = require('lodash.padstart');
const {version} = require('../../package.json');

const hangInThereMessages = [
	'In the end, everything will be okay. If it\'s not okay, it\'s not yet the end.',
	'The difficulties of life are intended to make us better, not bitter.',
	'When life gives you a hundred reasons to cry, show life that you have a thousand reasons to smile.',
	'One minute of patience, ten years of peace.',

	'"In the end, it\'s not the years in your life that count. It\'s the life in your years." Abraham Lincoln',
	'"Patience is necessary, and one cannot reap immediately where one has sown." Soren Kierkegaard',
	'"There is more to life than increasing its speed." Mahatma Gandhi',
	'"In three words I can sum up everything I\'ve learned about life: it goes on." Robert Frost',
	'"Patience is bitter, but its fruit is sweet." Jean-Jacques Rousseau',
	'"He that can have patience can have what he will." Benjamin Franklin',
	'"All human wisdom is summed up in two words – wait and hope." Alexandre Dumas Père'
];

const now = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = padStart(date.getMonth() + 1, 2, '0');
	const day = padStart(date.getDay(), 2, '0');
	const hours = padStart(date.getHours(), 2, '0');
	const minutes = padStart(date.getMinutes(), 2, '0');
	const seconds = padStart(date.getSeconds(), 2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

module.exports.header = taskLabel => {
	console.log('');
	console.log(chalk.yellow.bgBlack('                                                                         '));
	console.log(chalk.yellow.bgBlack('                         _ _                  _     _                    '));
	console.log(chalk.yellow.bgBlack('               _     ___(_) |_ ___  __ _  ___(_)___| |_                  '));
	console.log(chalk.yellow.bgBlack('             _| |_  / __| | __/ _ \\/ _` |/ _ \\ / __| __|                 '));
	console.log(chalk.yellow.bgBlack('            |_   _| \\__ \\ | ||  __/ (_| |  __/ \\__ \\ |_                  '));
	console.log(chalk.yellow.bgBlack('              |_|   |___/_|\\__\\___|\\__, |\\___|_|___/\\__|                 '));
	console.log(chalk.yellow.bgBlack('                                   |___/                                 '));
	console.log(chalk.yellow.bgBlack(padEnd(`           EXCALIBUR ⚔ ${version}                  Task: ${taskLabel}`, 73)));
	console.log(chalk.yellow.bgBlack('                                                                         '));
	console.log(chalk.yellow.bgBlack('                                                                         '));

	console.log('');
};

module.exports.message = (symbol, message, color = chalk.white) =>
	console.log(`[${symbol}] ${chalk.white(`[${now()}]`)} ${color(message)}`);

module.exports.info = message => module.exports.message('⏵', message);
module.exports.success = message => module.exports.message('✓', message, chalk.green);
module.exports.warning = message => module.exports.message('⚠', message, chalk.yellow);
module.exports.error = message => module.exports.message('✗', message, chalk.red);
module.exports.hangin = () => module.exports.message(
	'ᗄ',
	`Hang in there! ${hangInThereMessages[Math.floor(Math.random() * hangInThereMessages.length)]}`,
	chalk.gray
);

module.exports.exit = (message, exitCode = 0) => {
	console.log(`${chalk.white(`[EXIT: ${now()}]`)} ${(exitCode === 0 ? chalk.green : chalk.red)(message)}`);
	console.log('');
	process.exit(exitCode); // eslint-disable-line unicorn/no-process-exit
};
