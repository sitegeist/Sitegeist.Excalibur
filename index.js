#!/usr/bin/env node
switch (process.env.npm_lifecycle_event) {
	case 'build:css':
		require('./build/css')();
		break;

	case 'watch:build:css':
		require('./build/css')(true);
		break;

	default:
		console.log(`Unknown command: ${process.env.npm_lifecycle_event}`);
		process.exit(1);
		break;
}
