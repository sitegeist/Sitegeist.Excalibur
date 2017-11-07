const chalk = require('chalk');
const pad = require('lodash.pad');
const padStart = require('lodash.padstart');

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

module.exports = () => {
	const Logger = class {
		constructor(scope = 'excalibur') {
			this.scope = scope;
			this.message = (symbol, message, color = chalk.white) => {
				console.log(`[${symbol}][${pad(scope.substring(0, 20), 20)}]${chalk.white(`[${now()}]`)} ${color(message)}`);
			};

			this.info = message => this.message('⏵', message);
			this.success = message => this.message('✓', message, chalk.green);
			this.warning = message => this.message('⚠', message, chalk.yellow);
			this.error = message => this.message('✗', message, chalk.red);
			this.debug = (message, level = 3) => {
				if (this.debugLevel < level) {
					return;
				}
				try {
					throw Error('');
				} catch (err) {
					if (this.debugLevel > 2) {
						console.log();
						console.log(`[🔧] ${err.stack.split('\n')[2].trim().replace(this.rootPath, '.')}:`);
					}

					this.message('🔧', `${message}`, chalk.white.bold); // eslint-disable-line

					if (this.debugLevel > 2) {
						console.log();
					}
				}
			};
		}

		async initializeObject() {
			const context = await this.objectManager.get('context');
			this.rootPath = context.rootPath;
			this.debugLevel = context.argv.verbosity || context.argv.v || 0;
		}

		async createInstance(scope) {
			const instance = new Logger(scope);

			instance.objectManager = this.objectManager;
			await instance.initializeObject();

			return instance;
		}
	};

	return new Logger();
};
