const path = require('path');
const webpack = require('webpack');

const GenerateEntryFilePlugin = require('./plugins/generate-entry-file');

module.exports = async api => {
	const {resolveLocalConfiguration, lookupPaths, argv, flowPackage} = api;
	const tmpFile = path.join(process.cwd(), 'Data/Temporary/Sitegeist.Excalibur/', flowPackage.packageKey, 'entry.js');
	const isProduction = argv.p || argv.production;

	const defaultConfiguration = {
		entry: {
			Main: [
				'babel-polyfill',
				'custom-event-polyfill',
				tmpFile
			]
		},
		output: {
			filename: '[name].js',
			path: path.join(process.cwd(), 'Packages/Sites', flowPackage.packageKey, 'Resources/Public/JavaScript')
		},
		plugins: [
			new webpack.WatchIgnorePlugin([tmpFile]),
			new GenerateEntryFilePlugin(flowPackage, tmpFile)
		].concat(
			isProduction ? [
				new webpack.DefinePlugin({
					'process.env.NODE_ENV': JSON.stringify('production')
				}),
				new webpack.optimize.UglifyJsPlugin({
					sourceMap: true
				})
			] : []
		),
		module: {
			rules: [
				{
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									'babel-preset-react',
									'babel-preset-react-optimize',
									'babel-preset-es2015',
									'babel-preset-stage-0'
								].map(require.resolve)
							}
						}
					]
				}
			]
		}
	};
	const override = await resolveLocalConfiguration('build:js', {webpack: id => id}, 'object');

	return override.webpack(defaultConfiguration);
};
