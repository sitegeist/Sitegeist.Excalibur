const {version} = require('../package.json');
const chalk = require('chalk');

const now = () => {
	const date = new Date();

	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

module.exports.header = () => {
	console.log('');
	console.log(chalk.yellow.bgBlack(`
                 _ _                  _     _
       _     ___(_) |_ ___  __ _  ___(_)___| |_
     _| |_  / __| | __/ _ \\/ _\` |/ _ \\ / __| __|
    |_   _| \\__ \\ | ||  __/ (_| |  __/ \\__ \\ |_
      |_|   |___/_|\\__\\___|\\__, |\\___|_|___/\\__|
                           |___/

                                   Neos Build Essentials ${version}
	`));
	console.log('');
};

module.exports.message = (message, color = chalk.white) =>
	console.log(`${chalk.white(`[${now()}]`)} ${color(message)}`);

module.exports.exit = (message, exitCode = 0) => {
	console.log(`${chalk.white(`[EXIT: ${now()}]`)} ${(exitCode === 0 ? chalk.green : chalk.red)(message)}`);
	console.log('');
	process.exit(exitCode);
};
