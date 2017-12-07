module.exports = ({scope, id, configuration, flowPackage, manifest}) => {
	const Customizer = class {
		constructor() {
			this.run = () => this.instances.reduce((configuration, instance) => {
				if (!instance || !instance[id] || instance.condition === false) {
					return configuration;
				}

				return instance[id](configuration);
			}, configuration);
		}

		async initializeObject() {
			const pathsToCustomizationFiles = await scope.pathsToCustomizationFiles;

			this.instances = [];

			if (pathsToCustomizationFiles.length) {
				this.instances = await Promise.all(pathsToCustomizationFiles.map(async pathToCustomizationFile => {
					const CustomizerClass = require(pathToCustomizationFile);
					const instance = new CustomizerClass();

					instance.flowPackage = flowPackage;
					instance.manifest = manifest;
					instance.logger = await (await this.objectManager.get('logger')).createInstance(id);
					instance.browsers = await this.objectManager.get('browsers');

					return instance;
				}));
			}

			this.instances = this.instances || [];
		}
	};

	return new Customizer();
};
