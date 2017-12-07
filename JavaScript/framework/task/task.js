module.exports = (TaskClass, runner, flowPackage, manifests) => {
	const Task = class {
		constructor() {
			this.configure = async (...args) => {
				await this.instance.configure(...args);

				this.instance.configuration = await manifests.reduce(async (configuration, manifest) => {
					return manifest.customize(this.instance.id, await configuration, {
						flowPackage
					});
				}, Promise.resolve(this.instance.configuration));
			};
			this.prepare = (...args) => {
				if (this.instance.prepare) {
					return this.instance.prepare(...args);
				}
			};
			this.run = (...args) => {
				if (process.env.NODE_ENV !== 'production') {
					this.hangInThere.start();
				}

				this.instance.logger
					.debug(`Using configuration: ${JSON.stringify(this.instance.configuration, null, 4)}`, 3);

				return this.instance.run(...args);
			};
			this.watch = (...args) => {
				if (this.isWatchable) {
					if (process.env.NODE_ENV !== 'production') {
						this.hangInThere.start();
					}
					return this.instance.watch(...args);
				}
			};
		}

		async initializeObject() {
			this.printErrors = await this.objectManager.get('task/printErrors');
			this.hangInThere = await this.objectManager.get('logger/hangInThere');

			this.instance = new TaskClass();

			this.instance.flowPackage = flowPackage;
			this.instance.objectManager = this.objectManager;
			this.instance.logger = await (await this.objectManager.get('logger')).createInstance(this.instance.id);

			this.instance.configuration = {};

			this.instance.formatErrors = errors => {
				this.instance.logger.error(`Found ${errors.length} error(s) during "${this.instance.label}"`);
				this.printErrors.print(errors, this.instance.logger);
			};

			this.instance.formatWarnings = warnings => {
				console.log('TODO: Implement formatWarnings', {warnings});
			};

			this.instance.success = () => {
				this.instance.logger.success(`${this.instance.label} successfully completed :)`);
				this.hangInThere.stop();
				return 0;
			};

			this.instance.error = () => {
				this.instance.logger.error(`${this.instance.label} failed :(`);
				this.hangInThere.stop();
				return 1;
			};

			this.instance.isFileIgnored = pathToFile => manifests
				.some(manifest => manifest.ignores(pathToFile));

			if (this.instance.initializeObject) {
				this.instance.initializeObject();
			}
		}

		get id() {
			return this.instance.id;
		}

		get label() {
			return this.instance.label;
		}

		get isWatchable() {
			return Boolean(this.instance.watch);
		}
	};

	return new Task();
};
