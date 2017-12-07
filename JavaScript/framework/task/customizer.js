module.exports = ({scope, id, configuration, flowPackage, manifest}) => {
	const Customizer = class {
		constructor() {
			this.run = () => {
				if (!this.instance || !this.instance[id]) {
					return configuration;
				}

				return this.instance[id](configuration);
			};
		}

		async initializeObject() {
			const pathToCustomizationFile = await scope.pathToCustomizationFile;

			if (pathToCustomizationFile) {
				const CustomizerClass = require(pathToCustomizationFile);

				this.instance = new CustomizerClass();
				this.instance.flowPackage = flowPackage;
				this.instance.manifest = manifest;
				this.instance.logger = await (await this.objectManager.get('logger')).createInstance(id);
			}
		}
	};

	return new Customizer();
};
