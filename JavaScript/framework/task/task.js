module.exports = (TaskClass, runner) => {
	const Task = class {
		constructor() {
			this.configure = (...args) => this.instance.configure(...args);
			this.run = (...args) => {
				return this.instance.run(...args);
			};
			this.watch = (...args) => {
				if (this.isWatchable) {
					return this.instance.watch(...args);
				}
			};
		}

		async initializeObject() {
			this.errorHandler = await this.objectManager.get('task/errorHandler');

			this.instance = new TaskClass();
			this.instance.objectManager = this.objectManager;
			this.instance.logger = await (await this.objectManager.get('logger')).createInstance(this.instance.id);

			this.instance.formatErrors = errors => {
				this.instance.logger.error(`Found ${errors.length} error(s) during "${this.instance.label}"`);
				this.errorHandler.handleErrors(errors, this.instance.logger);
			};

			this.instance.formatWarnings = warnings => {
				console.log('TODO: Implement formatWarnings', {warnings});
			};

			this.instance.success = () => {
				this.instance.logger.success(`${this.instance.label} successfully completed :)`);
				runner.finalize();
			};

			this.instance.error = () => {
				this.instance.logger.error(`${this.instance.label} failed :(`);
				runner.finalize(1);
			};

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
