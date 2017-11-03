module.exports = (key, modifierFn, position = 'end') => {
	const Modifier = class {
		constructor() {
			this.apply = configuration => modifierFn(configuration);
		}

		get key() {
			return key;
		}

		get position() {
			return position;
		}
	};

	return new Modifier();
};
