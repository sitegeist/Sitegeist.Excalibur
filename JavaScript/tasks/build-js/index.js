const path = require('path');
const webpack = require('webpack');
const {$all, $set, $add} = require('plow-js');

const GenerateEntryFilePlugin = require('./webpackPlugins/generateEntryFile');

module.exports = class {
	get id() {
		return 'build:js';
	}

	get label() {
		return 'Build JavaScript';
	}

	constructor() {
		this.build = (err, stats) => {
			if (err) {
				throw err;
			} else if (stats.hasErrors()) {
				this.formatErrors(stats.compilation.errors);
				this.formatWarnings(stats.compilation.warnings);
				this.error();
			} else {
				this.success();
			}

			this.continue();
		};
	}

	async configure(flowPackage, manifest) {
		const webpackConfiguration = await this.objectManager.get('configuration', $all(
			$set('entry', {}),
			$set('output', {}),
			$set('plugins', []),
			$set('module.rules', []),
			{}
		));
		const entryFileName = await flowPackage.createTemporaryFileName('entry.js');

		webpackConfiguration.append('excalibur/entry', $set('entry', {
			main: [entryFileName]
		}));

		webpackConfiguration.append('excalibur/output', $set('output', {
			filename: '[name].js',
			path: path.join(await flowPackage.paths.publicResources, 'JavaScript')
		}));

		webpackConfiguration.append('excalibur/entry-file-plugin', $add(
			'plugins',
			new GenerateEntryFilePlugin(flowPackage, entryFileName)
		));

		webpackConfiguration.append('excalibur/babel-loader', $add('module.rules', {
			test: /\.js$/,
			use: 'babel-loader'
		}));

		await manifest.customize(webpackConfiguration, 'build:js:webpack');
		await flowPackage.customize(webpackConfiguration, 'build:js:webpack');

		this.compiler = webpack(webpackConfiguration.configuration);
		this.packageKey = await flowPackage.packageKey;
	}

	async run() {
		this.compiler.run(this.build);
	}

	async watch() {
		this.compiler.watch({}, this.build);
	}
};
