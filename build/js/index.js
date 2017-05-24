const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const webpack = require('webpack');
const tmp = require('tmp');
const uuid = require('uuid');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');

const logger = require('../../logger');
const resolveFusionDependencies = require('../../utils/resolveFusionDependencies');
const generateEntryFile = require('./generate-entry-file');

module.exports = watch => {
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

		const compiler = webpack(webpackConfig);
		const build = debounce(() => compiler.run(err => {
			const method = watch ? 'message' : 'exit';

			if (err) {
				console.error(err);
				logger[method](`${process.env.npm_lifecycle_event} failed :(`, 1);
			} else {
				logger[method](`${process.env.npm_lifecycle_event} successfully completed :)`);
			}
		}), 200);

		const jsFilePattern = path.join(sitePackage, '**/*.js');
		if (watch) {
			chokidar.watch(jsFilePattern)
				.on('ready', build)
				.on('add', build)
				.on('change', build)
				.on('unlink', build);
		} else {
			build();
		}
	};

	sitePackages.forEach(buildJsForSitePackage);
};
