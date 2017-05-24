const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const webpack = require('webpack');
const tmp = require('tmp');
const uuid = require('uuid');

const logger = require('../../logger');
const resolveFusionDependencies = require('../../utils/resolveFusionDependencies');
const generateEntryFile = require('./generate-entry-file');

module.exports = () => {
	const sitePackages = glob.sync('Packages/Sites/*');

	const buildJsForSitePackage = sitePackage => {
		const tmpDir = tmp.dirSync();
		const tmpFile = path.join(tmpDir.name, sitePackage.split('/').slice(-1)[0], uuid.v4() + '.js');
		const components = resolveFusionDependencies(sitePackage.split('/').slice(-1)[0])
			.map(lookupPath => path.join(lookupPath, 'Component.js'))
			.filter(filePath => fs.pathExistsSync(filePath));

		const webpackConfig = {
			entry: {
				Main: tmpFile
			},
			output: {
				filename: '[name].js',
				path: path.join(process.cwd(), sitePackage, 'Resources/Public/JavaScript')
			},
			plugins: [
				new (function () {
					this.apply = compiler => {
						compiler.plugin('run', (_, done) => {
							generateEntryFile(tmpFile, components);
							done();
						});
					};
				})()
			]
		};

		//
		// Autogenerate bootstrap code
		//

		const compiler = webpack(webpackConfig);
		compiler.run(err => {
			if (err) {
				console.error(err);
				logger.exit(`${process.env.npm_lifecycle_event} failed :(`, 1);
			} else {
				logger.exit(`${process.env.npm_lifecycle_event} successfully completed :)`);
			}
		});
	};

	sitePackages.forEach(buildJsForSitePackage);
};
