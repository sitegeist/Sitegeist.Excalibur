const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const postcss = require('postcss');
const CleanCss = require('clean-css');
const {$add, $set} = require('plow-js');

module.exports = class {
	get id() {
		return 'build:css';
	}

	get label() {
		return 'Build CSS';
	}

	async configure(flowPackage, manifest) {
		const generalConfiguration = await this.objectManager.get('configuration', {});

		generalConfiguration.append('excalibur/css-target-file', $set(
			'cssTargetFile',
			path.join(flowPackage.paths.publicResources, 'Styles/Main.css')
		));

		generalConfiguration.append('excalibur/css-file-pattern', $set(
			'cssFilePattern',
			path.join(flowPackage.paths.privateResources, 'Fusion/**/*.css')
		));

		await manifest.customize(generalConfiguration, 'build:css:general');
		await flowPackage.customize(generalConfiguration, 'build:css:general');

		this.configuration = generalConfiguration.configuration;

		const postcssConfiguration = await this.objectManager.get('configuration', {
			plugins: []
		});

		postcssConfiguration.append('excalibur/autoprefixer', $add('plugins', require('autoprefixer')));
		postcssConfiguration.append('excalibur/precss', $add('plugins', require('precss')));
		postcssConfiguration.append('excalibur/postcss-map', $add('plugins', require('postcss-map')({
			maps: [await flowPackage.settings]
		})));

		await manifest.customize(postcssConfiguration, 'build:css:postcss');
		await flowPackage.customize(postcssConfiguration, 'build:css:postcss');

		this.postcss = postcss(postcssConfiguration.configuration);
	}

	async run() {
		try {
			const cssFiles = glob.sync(this.configuration.cssFilePattern);

			this.logger.debug(`Found ${cssFiles.length} CSS files.`, 1);

			const entireCssString = cssFiles
				.map(cssFile => fs.readFileSync(cssFile, 'utf8')).join('\n');
			const result = await this.postcss.process(entireCssString);
			const minifiedCssSource = new CleanCss({level: 2}).minify(result.css).styles;

			this.logger.debug(`Write ${minifiedCssSource.length} Bytes to target CSS file.`, 1);

			await fs.ensureFile(this.configuration.cssTargetFile);
			await fs.writeFile(this.configuration.cssTargetFile, minifiedCssSource);
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
