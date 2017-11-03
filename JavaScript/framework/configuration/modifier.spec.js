const createModifier = require('./modifier');

test(`modifier factory function should be defined`, () => {
	expect(createModifier).toBeDefined();
});

test(`modifier factory function should create an object with an api`, () => {
	const modifier = createModifier('key', () => {});

	expect(modifier.key).toBeDefined();
	expect(modifier.position).toBeDefined();
	expect(modifier.apply).toBeDefined();
});
