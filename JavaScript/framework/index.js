const path = require('path');

module.exports = (context, nativeRequire = require) => {
	const classCache = {context};
	const factoryCache = {};

	const getOrCreateInstance = (name, ...args) => {
		if (classCache[name]) {
			return classCache[name];
		}

		const pathToModule = path.join(__dirname, name);
		const factoryFn = factoryCache[name] || nativeRequire(pathToModule);
		const instance = factoryFn.singleton ? factoryFn.singleton(...args) : factoryFn(...args);

		if (factoryFn.singleton) {
			classCache[name] = instance;
		}

		return instance;
	};

	const ObjectManager = class {
		constructor() {
			this.set = (name, value) => {
				factoryCache[name] = value;
			};

			this.get = async (name, ...args) => {
				const instance = await getOrCreateInstance(name, ...args);

				instance.objectManager = this;

				if (instance.initializeObject) {
					await instance.initializeObject();
				}

				return instance;
			};
		}
	};

	return new ObjectManager();
};
