const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const postcss = require('postcss');
const CleanCss = require('clean-css');

module.exports = class {
	get id() {
		return 'build:css';
	}

	get label() {
		return 'Build CSS';
	}

	async configure() {
		//
		// General configuration
		//
		this.configuration.general = {
			cssTargetFile: path.join(this.flowPackage.paths.publicResources, 'Styles/main.css'),
			cssFilePattern: path.join(this.flowPackage.paths.privateResources, 'Fusion/**/*.css'),
			minify: true
		};

		//
		// postcss configuration
		//
		this.configuration.postcss = {
			plugins: [
				require('autoprefixer'),
				require('precss'),
				require('postcss-map')({
					maps: [await this.flowPackage.settings]
				})
			]
		};

		//
		// cleancss configuration
		//
		this.configuration.cleancss = {
			level: 2
		};
	}

	async run() {
		try {
			const cssFiles = glob.sync(this.configuration.general.cssFilePattern).filter(f => !this.isFileIgnored(f));

			this.logger.debug(`Found ${cssFiles.length} CSS file(s).`, 1);

			const entireCssString = cssFiles
				.map(cssFile => fs.readFileSync(cssFile, 'utf8')).join('\n');
			const result = await postcss(this.configuration.postcss.plugins).process(entireCssString);
			const minifiedCssSource = this.configuration.general.minify ?
				new CleanCss(this.configuration.cleancss).minify(result.css).styles : result.css;

			await fs.ensureFile(this.configuration.general.cssTargetFile);
			await fs.writeFile(this.configuration.general.cssTargetFile, minifiedCssSource);

			this.logger.debug(`Wrote ${minifiedCssSource.length} Bytes to target CSS file.`, 1);
		} catch (err) {
			this.formatErrors([err]);
			return this.error();
		}

		return this.success();
	}

	async watch() {
		const run = () => this.run();

		chokidar.watch(this.configuration.cssFilePattern, {ignoreInitial: true})
			.on('ready', run)
			.on('add', run)
			.on('change', run)
			.on('unlink', run);
	}
};
