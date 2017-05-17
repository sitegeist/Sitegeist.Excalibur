const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const webpack = require('webpack');
const tmp = require('tmp');
const uuid = require('uuid');

const generateEntryFile = require('./generate-entry-file');

module.exports = watch => {
	const sitePackages = glob.sync('Packages/Sites/*');

	const buildJsForSitePackage = sitePackage => {
		const tmpDir = tmp.dirSync();
		const tmpFile = path.join(tmpDir.name, sitePackage.split('/').slice(-1)[0], uuid.v4() + '.js');
		const components = glob.sync(path.join(sitePackage, 'Resources/Private/Fusion/**/Component.js'));
		const webpackConfig = {
			entry: {
				'Main': tmpFile
			},
			plugins: [
				new (function () {
					this.apply = compiler => {
						compiler.plugin('run', (_, done) => {
							generateEntryFile(tmpFile, components);
							console.log(tmpFile);
							done();
						})
					};
				})
			]
		};

		//
		// Autogenerate bootstrap code
		//

		const compiler = webpack(webpackConfig);
		compiler.run((err, stats) => {
			console.log(err, stats);
		});
	};

	sitePackages.forEach(buildJsForSitePackage);
};
