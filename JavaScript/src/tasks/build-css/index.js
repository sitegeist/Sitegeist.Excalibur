const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const postcss = require('postcss');
const CleanCss = require('clean-css');

const createPostCssConfiguration = require('./create-postcss-configuration');

module.exports.id = 'build:css';
module.exports.label = 'Build CSS';
module.exports.isWatchable = true;

module.exports.run = async api => {
	const {logger, error, success, watch, flowPackage} = api;
	const handleSuccess = watch ? logger.success : success;
	const handleError = watch ? logger.error : error;

	const cssFilePattern = `${flowPackage.paths.resources}/Private/**/*.css`;
	const configuration = await createPostCssConfiguration(api);

	const build = async () => {
		try {
			const entireCssString = glob.sync(cssFilePattern)
				.map(cssFile => fs.readFileSync(cssFile, 'utf8')).join('\n');
			const result = await postcss(configuration).process(entireCssString);
			const minifiedCssSource = new CleanCss({level: 2}).minify(result.css).styles;

			await fs.ensureDir(`${flowPackage.paths.resources}/Public/Styles`);
			await fs.writeFileSync(`${flowPackage.paths.resources}/Public/Styles/Main.css`, minifiedCssSource);
		} catch (err) {
			logger.error(err.message || err);
			handleError(`CSS build for "${flowPackage.packageKey}" failed :(`);
		}

		handleSuccess(`CSS for "${flowPackage.packageKey}" successfully built :)`);

		if (watch) {
			logger.info(`Watching "${flowPackage.packageKey}"...`);
		}
	};
	const debouncedBuild = debounce(build, 500);

	if (watch) {
		chokidar.watch(cssFilePattern)
			.on('ready', debouncedBuild)
			.on('add', debouncedBuild)
			.on('change', debouncedBuild)
			.on('unlink', debouncedBuild);
	} else {
		build();
	}
};
