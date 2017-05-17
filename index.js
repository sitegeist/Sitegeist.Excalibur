#!/usr/bin/env node

const logger = require('./logger');

logger.header();

switch (process.env.npm_lifecycle_event) {
	case 'build:css':
		require('./build/css')();
		break;

	case 'watch:build:css':
		require('./build/css')(true);
		break;

	case 'build:js':
		require('./build/js')();
		break;

	default:
		logger.exit(`Unknown command: ${process.env.npm_lifecycle_event}`, 1);
		break;
}
