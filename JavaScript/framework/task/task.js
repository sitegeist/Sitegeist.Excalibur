module.exports = TaskClass => {
	const Task = class {
		constructor() {
			this.configure = (...args) => this.instance.configure(...args);
			this.run = (...args) => {
				this.isWatchMode = false;
				return this.instance.run(...args);
			};
			this.watch = (...args) => {
				if (this.isWatchable) {
					this.isWatchMode = true;
					return this.instance.watch(...args);
				}
			};
		}

		initializeObject() {
			this.isWatchMode = false;
			this.instance = new TaskClass();
			this.instance.objectManager = this.objectManager;

			this.instance.formatErrors = errors => {
				console.log('TODO: Implement formatErrors', {errors});
			};

			this.instance.formatWarnings = warnings => {
				console.log('TODO: Implement formatWarnings', {warnings});
			};

			this.instance.success = () => {
				console.log('TODO: Implement success');
			};

			this.instance.error = () => {
				console.log('TODO: Implement error');
			};

			this.instance.continue = () => {
				if (this.isWatchMode) {
					console.log('TODO: Implement continue');
				}
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
