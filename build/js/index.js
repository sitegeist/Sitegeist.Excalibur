const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const webpack = require('webpack');
const tmp = require('tmp');
const uuid = require('uuid');

const logger = require('../../logger');
const resolveFusionDependencies = require('../../utils/resolveFusionDependencies');
const generateEntryFile = require('./generate-entry-file');

module.exports = watch => {
	const sitePackages = glob.sync('Packages/Sites/*');

	const buildJsForSitePackage = sitePackage => {
		const tmpDir = tmp.dirSync();
		const tmpFile = path.join(tmpDir.name, sitePackage.split('/').slice(-1)[0], uuid.v4() + '.js');

		const webpackConfig = {
			entry: {
				Main: [
					'babel-polyfill',
					'custom-event-polyfill',
					tmpFile
				]
			},
			output: {
				filename: '[name].js',
				path: path.join(process.cwd(), sitePackage, 'Resources/Public/JavaScript')
			},
			plugins: [
				new webpack.WatchIgnorePlugin([tmpFile]),
				new (function () {
					this.apply = compiler => {
						const generate = (_, done) => {
							const components = resolveFusionDependencies(sitePackage.split('/').slice(-1)[0])
								.reduce((lookupPaths, currentPath) => {
									lookupPaths.push(path.join(currentPath, 'Component.js'));
									lookupPaths.push(path.join(currentPath, 'component.js'));
									lookupPaths.push(path.join(currentPath, 'Index.js'));
									lookupPaths.push(path.join(currentPath, 'index.js'));
									return lookupPaths;
								}, [])
								.filter(filePath => fs.pathExistsSync(filePath));

							generateEntryFile(tmpFile, components);
							done();
						};

						compiler.plugin('run', generate);
						compiler.plugin('watch-run', generate);
					};
				})()
			],
			module: {
				rules: [
					{
						test: /\.js$/,
						use: [
							{
								loader: 'babel-loader',
								options: {
									presets: [
										'babel-preset-es2015',
										'babel-preset-stage-0',
										'babel-preset-react',
										'babel-preset-react-optimize'
									].map(require.resolve)
								}
							}
						]
					}
				]
			}
		};

		const overriddenWebpackConfig = fs.existsSync(path.join(process.cwd(), 'excalibur.config.js')) ?
			require(path.join(process.cwd(), 'excalibur.config.js'))['build:js'](webpackConfig) : webpackConfig;

		const compiler = webpack(overriddenWebpackConfig);
		const build = (err, stats) => {
			const method = watch ? 'message' : 'exit';

			if (err || stats.hasErrors()) {
				const message = `${process.env.npm_lifecycle_event} failed :(`;

				console.error(err, stats);

				if (watch) {
					logger.message(message);
				} else {
					logger.exit(message, 1);
				}
			} else {
				logger[method](`${process.env.npm_lifecycle_event} successfully completed :)`);
			}
		};

		if (watch) {
			compiler.watch({}, build);
		} else {
			compiler.run(build);
		}
	};

	sitePackages.forEach(buildJsForSitePackage);
};
