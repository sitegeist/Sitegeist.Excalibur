const path = require('path');
const fs = require('fs-extra');
const prompt = require('prompt-promise');
const open = require('open');

const captureScreenshot = require('./captureScreenshot');
const compare = require('./compare');
const createDiff = require('./createDiff');

module.exports = async api => {
	const {client, flowPackage, component, options, viewport, logger, serverOptions, argv} = api;
	const screenshotsDirectory = path.join(
		flowPackage.paths.components,
		flowPackage.components[component.name].componentDirectory,
		'__screenshots__',
		`${viewport.width}x${viewport.height}`
	);
	const referenceScreenshotFileName = path.join(screenshotsDirectory, 'reference.png');
	const subjectScreenshotFileName = path.join(screenshotsDirectory, 'subject.png');
	const diffFileName = path.join(screenshotsDirectory, 'diff.png');
	const deviceMetrics = {
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: 0,
		mobile: false,
		fitWindow: false
	};
	const url = `http://${serverOptions.host}:${serverOptions.port}/${serverOptions.endpoint}?prototypeName=${encodeURIComponent(component.name)}&sitePackageKey=${encodeURIComponent(flowPackage.packageKey)}`;

	logger.info(`Setting up device (${viewport.width}x${viewport.height})...`);

	await client.Emulation.setDeviceMetricsOverride(deviceMetrics);
	await client.Emulation.setVisibleSize({
		width: viewport.width,
		height: viewport.height
	});
	await client.Page.navigate({url});
	await client.Page.loadEventFired();

	if (options.full) {
		const {root: {nodeId: documentNodeId}} = await client.DOM.getDocument();
		const {nodeId: bodyNodeId} = await client.DOM.querySelector({
			selector: 'body',
			nodeId: documentNodeId
		});
		const {model: {height}} = await client.DOM.getBoxModel({nodeId: bodyNodeId});

		await client.Emulation.setVisibleSize({width: viewport.width, height: Math.max(height, viewport.height)});
		await client.Emulation.forceViewport({x: 0, y: 0, scale: 1});
	}

	await (new Promise(resolve => setTimeout(resolve, Math.max(options.delay, 100))));

	await fs.ensureDir(screenshotsDirectory);

	if (await fs.pathExists(referenceScreenshotFileName)) {
		logger.info(`Found reference screenshot`);
		logger.info(`Creating new subject screenshot...`);

		await captureScreenshot(client.Page, subjectScreenshotFileName);

		logger.info(`Comparing screenshots...`);

		const result = await compare(referenceScreenshotFileName, subjectScreenshotFileName);

		if (result) {
			await fs.remove(subjectScreenshotFileName);
		} else {
			logger.info(`A difference could be detected.`);
			logger.info(`Creating new diff...`);

			await createDiff(referenceScreenshotFileName, subjectScreenshotFileName, diffFileName);

			if (argv.i || argv.interactive) {
				open(`file:${diffFileName}`);
				const accepted = await prompt('Do you accept this change? (y/N) ');

				if (accepted.toLowerCase() === 'y') {
					await fs.remove(referenceScreenshotFileName);
					await fs.remove(diffFileName);
					await fs.move(subjectScreenshotFileName, referenceScreenshotFileName);

					logger.info('Change accepted.');
					return true;
				}
			}
		}

		return result || `${component.name} @ ${viewport.width}x${viewport.height}`;
	}

	logger.info(`Could not find reference screenshot.`);
	logger.info(`Creating new reference screenshot...`);

	await captureScreenshot(client.Page, referenceScreenshotFileName);
	return true;
};
