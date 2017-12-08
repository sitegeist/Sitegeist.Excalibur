# How to extend configuration

```js
module.exports = class {

	//
	// Pick a different name for the bundled javascript file
	//
    async [`build:js`](configuration) {
		//
		// Inside this method, you have access to a logger and other API objects
		//
		this.logger.debug(`Pick a different name for the bundled javascript file`, 3);

		//
		// `configuration` contains among others a webpack configuration object that
		// can be manipulated here
		//
        configuration.webpack.entry = {
			//
			// This way, the bundled file will be called index.js instead of main.js
			//
			index: configuration.webpack.entry.main
		};

		//
		// Return the altered configuration to apply the changes
		//
        return configuration;
    }
}
```
