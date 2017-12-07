const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const chokidar = require('chokidar');

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
		this.createBuildFunction = resolve => (err, stats) => {
			if (err) {
				this.formatErrors([err]);
			} else if (stats.hasErrors()) {
				this.formatErrors(stats.compilation.errors);
				this.formatWarnings(stats.compilation.warnings);
				resolve(this.error());
			} else {
				this.logger.debug(stats.toString(), 3);
				resolve(this.success());
			}
		};

		this.generateEntryFile = async () => {
			const fusionFiles = (await this.flowPackage.fusionFiles)
				.filter(f => !this.isFileIgnored(path.join(this.flowPackage.paths.root, f)));
			const javascriptComponentMap = (await Promise.all(fusionFiles.map(async fusionFile => {
				const [prototypeName, javascriptFile] = await Promise.all([
					await this.flowPackage.getPrototypeNameFromFusionFilePath(fusionFile),
					await this.flowPackage.getJavaScriptFileNameFromFusionFilePath(fusionFile)
				]);
				const javascriptFileName = path.join(this.flowPackage.paths.root, javascriptFile);

				if (await fs.pathExists(javascriptFileName) && !this.isFileIgnored(javascriptFileName)) {
					return {
						prototypeName,
						javascriptFile: javascriptFileName
					};
				}
			}))).filter(i => i);

			this.logger.debug(`Found ${Object.values(javascriptComponentMap).length} JavaScript component(s).`, 1);

			await fs.ensureFile(this.configuration.entryFileName);
			await fs.writeFile(this.configuration.entryFileName, entryFileTemplate(javascriptComponentMap));

			this.logger.debug(`Generated entry file at ${this.configuration.entryFileName.replace(this.rootPath, '.')}`, 3);
		};
	}

	async initializeObject() {
		const context = await this.objectManager.get('context');
		this.rootPath = context.rootPath;
	}

	async configure() {
		this.configuration.entryFileName = await this.flowPackage.createTemporaryFileName('entry.js');
		this.configuration.entryFileRegenerationWatchPattern = path.join(this.flowPackage.paths.privateResources, 'Fusion/**/*.js');

		this.configuration.webpack = {
			entry: {
				main: [this.configuration.entryFileName]
			},
			output: {
				filename: '[name].js',
				path: path.join(await this.flowPackage.paths.publicResources, 'JavaScript')
			},
			module: {
				rules: [
					{
						test: /\.js$/,
						use: 'babel-loader'
					}
				]
			}
		};
	}

	async prepare() {
		this.compiler = webpack(this.configuration.webpack);
		this.packageKey = await this.flowPackage.packageKey;
	}

	async run() {
		//
		// Generate the entry file
		//
		await this.generateEntryFile();

		//
		// Run the webpack build
		//

		return new Promise(resolve => {
			this.compiler.run(this.createBuildFunction(resolve));
		});
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
		// Generate the entry file and listen for changes to regenerate the entry file, whenever a relevant file
		// is added or removed
		//
		await this.generateEntryFile();
		chokidar.watch(this.configuration.entryFileRegenerationWatchPattern, {ignoreInitial: true})
			.on('add', () => this.generateEntryFile())
			.on('unlink', () => this.generateEntryFile());

		//
		// Run the webpack watcher
		//
		this.compiler.watch({}, this.createBuildFunction(() => {}));
	}
};
