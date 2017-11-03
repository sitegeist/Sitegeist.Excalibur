const positionalArraySorter = require('./positionalArraySorter');
const createModifier = require('./modifier');
const Immutable = require('immutable');

module.exports = configuration => {
	let cachedConfiguration = null;
	const chain = {};
	const ModifierChain = class {
		constructor() {
			this.append = (key, ...args) => {
				cachedConfiguration = null;
				const modifier = createModifier(key, ...args);
				chain[modifier.key] = modifier;
			};
		}

		get configuration() {
			if (cachedConfiguration === null) {
				cachedConfiguration = positionalArraySorter(Object.values(chain))
					.reduce((configuration, {apply}) => apply(configuration), Immutable.fromJS(configuration)).toJS();
			}

			return cachedConfiguration;
		}
	};

	return new ModifierChain();
};
