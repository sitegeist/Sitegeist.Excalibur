const fs = require('fs-extra');
const glob = require('glob');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const postcss = require('postcss');
const CleanCss = require('clean-css');

const createSitePackageTask = require('../create-site-package-task');
const createPostCssConfiguration = require('./create-postcss-configuration');

module.exports = createSitePackageTask(
	//
	// Header depends on whether the user is watching
	//
	(_, watch) => watch ? 'Watch CSS Build' : 'Build CSS',

	async ({logger, resolveLocalConfiguration, resolveStyleSettings, error, success}, watch, sitePackageName, sitePackagePath) => {
		const handleSuccess = watch ? logger.success : success;
		const handleError = watch ? logger.error : error;

		const cssFilePattern = `${sitePackagePath}/Resources/Private/**/*.css`;
		const configuration = await createPostCssConfiguration({
			resolveLocalConfiguration,
			resolveStyleSettings,
			sitePackageName,
			logger,
			error
		});

		const build = async () => {
			try {
				const entireCssString = glob.sync(cssFilePattern)
					.map(cssFile => fs.readFileSync(cssFile, 'utf8')).join('\n');
				const result = await postcss(configuration).process(entireCssString);
				const minifiedCssSource = new CleanCss({level: 2}).minify(result.css).styles;

				await fs.ensureDir(`${sitePackagePath}/Resources/Public/Styles`);
				await fs.writeFileSync(`${sitePackagePath}/Resources/Public/Styles/Main.css`, minifiedCssSource);
			} catch (err) {
				logger.error(err.message || err);
				handleError(`CSS build for "${sitePackageName}" failed :(`);
			}

			handleSuccess(`CSS for "${sitePackageName}" successfully built :)`);
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
	}
);
