const createModifierChain = require('./modifierChain');

test(`modifier chain factory function should be defined`, () => {
	expect(createModifierChain).toBeDefined();
});

test(`modifier chain should allow to progressively modify configuration objects`, () => {
	const chain = createModifierChain({});

	chain.append('a', c => c.set('a', 'Hello A'));
	chain.append('b', c => c.set('b', 'Hello B'));

	expect(chain.configuration.a).toEqual('Hello A');
	expect(chain.configuration.b).toEqual('Hello B');
});

test(`modifier chain should allow to overwrite modifiers`, () => {
	const chain = createModifierChain({});

	chain.append('a', c => c.set('a', 'Hello A'));

	expect(chain.configuration.a).toEqual('Hello A');

	chain.append('a', c => c.set('a', 'Hello Overwritten A'));

	expect(chain.configuration.a).toEqual('Hello Overwritten A');
});

test(`modifier chain should allow to define positions for modifiers`, () => {
	const chain = createModifierChain({});

	chain.append('a', c => c.set('a', `Hello, ${c.get('a')}!`));
	chain.append('b', c => c.set('a', 'World'));

	expect(chain.configuration.a).toEqual('World');

	chain.append('b', c => c.set('a', 'World'), 'before a');

	expect(chain.configuration.a).toEqual('Hello, World!');
});
