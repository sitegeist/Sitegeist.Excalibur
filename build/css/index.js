const fs = require('fs-extra');
const glob = require('glob');
const postcss = require('postcss');
const CleanCss = require('clean-css');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');

module.exports = watch => glob('Packages/Sites/*', (err, sitePackages) => {
	if (err) {
		throw err;
	}

	const buildCssForSitepackage = sitePackage => {
		const [sitePackageName] = sitePackage.split('/').slice(-1);
		const cssFilePattern = `${sitePackage}/Resources/Private/**/*.css`;

		const build = debounce(() => glob(cssFilePattern, (err, cssFiles) => {
			if (err) {
				throw err;
			}

			const entireCssString = cssFiles.map(cssFile => fs.readFileSync(cssFile, 'utf8')).join('\n');

			console.log(`Building styles for site package "${sitePackageName}"...`);

			postcss([
				require('autoprefixer'),
				require('precss')()
			]).process(entireCssString).then(result => {
				fs.ensureDirSync(`${sitePackage}/Resources/Public/Styles`);
				fs.writeFileSync(`${sitePackage}/Resources/Public/Styles/Main.css`, new CleanCss({
					level: 2
				}).minify(result.css).styles);

				console.log(`Successfully written "${sitePackage}/Resources/Public/Styles/Main.css" :)`);
			}).catch(err => console.error(err));
		}), 100);

		if (watch) {
			chokidar.watch(cssFilePattern)
				.on('ready', build)
				.on('add', build)
				.on('change', build)
				.on('unlink', build);
		} else {
			build();
		}
	};

	sitePackages.forEach(buildCssForSitepackage);
});
