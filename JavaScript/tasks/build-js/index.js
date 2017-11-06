const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const chokidar = require('chokidar');
const {$all, $set, $add} = require('plow-js');

const entryFileTemplate = components => `
require('sitegeist-excalibur/JavaScript/runtime')({
${components.map(component => `
	'${component.prototypeName}': require('${component.javascriptFile}')
`)}
});
`.trim();

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
				this.formatErrors([err]);
			} else if (stats.hasErrors()) {
				this.formatErrors(stats.compilation.errors);
				this.formatWarnings(stats.compilation.warnings);
				this.error();
			} else {
				this.logger.debug(stats.toString(), 3);
				this.success();
			}
		};

		this.generateEntryFile = async () => {
			const fusionFiles = await this.flowPackage.fusionFiles;
			const javascriptComponentMap = (await Promise.all(fusionFiles.map(async fusionFile => {
				const [prototypeName, javascriptFile] = await Promise.all([
					await this.flowPackage.getPrototypeNameFromFusionFilePath(fusionFile),
					await this.flowPackage.getJavaScriptFileNameFromFusionFilePath(fusionFile)
				]);

				if (await fs.pathExists(path.join(this.flowPackage.paths.root, javascriptFile))) {
					return {
						prototypeName,
						javascriptFile: path.join(this.flowPackage.paths.root, javascriptFile)
					};
				}
			}))).filter(i => i);

			this.logger.debug(`Found ${Object.values(javascriptComponentMap).length} JavaScript components.`, 1);

			await fs.ensureFile(this.entryFileName);
			await fs.writeFile(this.entryFileName, entryFileTemplate(javascriptComponentMap));

			this.logger.debug(`Generated entry file at ${this.entryFileName.replace(this.rootPath, '.')}`, 3);
		};
	}

	async initializeObject() {
		const context = await this.objectManager.get('context');
		this.rootPath = context.rootPath;
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

		webpackConfiguration.append('excalibur/babel-loader', $add('module.rules', {
			test: /\.js$/,
			use: 'babel-loader'
		}));

		await manifest.customize(webpackConfiguration, 'build:js:webpack');
		await flowPackage.customize(webpackConfiguration, 'build:js:webpack');

		this.compiler = webpack(webpackConfiguration.configuration);
		this.packageKey = await flowPackage.packageKey;
		this.javascriptFilePattern = path.join(flowPackage.paths.privateResources, 'Fusion/**/*.js');
		this.entryFileName = entryFileName;
		this.flowPackage = flowPackage;
	}

	async run() {
		//
		// Generate the entry file
		//
		await this.generateEntryFile();

		//
		// Run the webpack build
		//
		this.compiler.run(this.build);
	}

	async watch() {
		//
		// Webpack has an initial 10 second delay when watching files. Since we're generating an entry file right
		// before the watcher is started, we're getting stuck in a loop and webpack is compiling the bundle over
		// and over again for 10 seconds.
		//
		// So, here's the workaround as per https://github.com/webpack/watchpack/issues/25#issuecomment-319292564
		//
		const timefix = 11000;
		this.compiler.plugin('watch-run', (watching, callback) => {
			watching.startTime += timefix;
			callback();
		});
		this.compiler.plugin('done', stats => {
			stats.startTime -= timefix;
		});

		//
		// Generate the entry file and listen for changes to regenerate the entry file, whenever a JavaScript file
		// is added or removed
		//
		await this.generateEntryFile();
		chokidar.watch(this.javascriptFilePattern, {ignoreInitial: true})
			.on('add', () => this.generateEntryFile())
			.on('unlink', () => this.generateEntryFile());

		//
		// Run the webpack watcher
		//
		this.compiler.watch({}, this.build);
	}
};
