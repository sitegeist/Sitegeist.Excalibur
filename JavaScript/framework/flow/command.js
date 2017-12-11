const path = require('path');
const fs = require('fs-extra');
const paramCase = require('param-case');
const {spawn} = require('child-process-promise');

/**
 * @module Command
 *
 * A service to run Flow commands
 */
module.exports.singleton = () => {
	const Command = class {
		async initializeObject() {
			const {rootPath} = await this.objectManager.get('context');

			this.logger = this.logger || (await this.objectManager.get('logger'));
			this.flowExecutable = path.join(rootPath, 'flow');
			this.rootPath = rootPath;

			if (!(await fs.pathExists(this.flowExecutable))) {
				this.logger.error(`Could not find flow executable at "${this.flowExecutable}"`);
				process.exit(1);
			}
		}

		async run(command, options = {}) {
			const commandString = `${this.flowExecutable} ${command} ${Object.keys(options).map(
				key => ` --${paramCase(key)} "${options[key]}"`
			)}`;
			const childProcess = spawn(this.flowExecutable, [command, ...[].concat(...Object.keys(options).map(
				key => [`--${paramCase(key)}`, options[key]]
			))], {capture: ['stdout']});

			this.logger.debug(`Executing "${commandString.replace(this.rootPath, '.')}".`, 2);

			childProcess.childProcess.stdout.on('data', data => {
				this.logger.debug(`"${commandString.replace(this.rootPath, '.')}":`, 3);
				this.logger.debug(data.toString(), 3);
			});

			childProcess.childProcess.stderr.on('data', data => {
				this.logger.error(`Error while executing "${commandString.replace(this.rootPath, '.')}":`);
				this.logger.error(data.toString());
			});

			const result = await childProcess;

			return result.stdout.toString();
		}

		async getInstance(logger) {
			const newInstance = new Command();

			newInstance.objectManager = this.objectManager;
			newInstance.logger = logger || this.logger;

			return newInstance;
		}
	};

	return new Command();
};
