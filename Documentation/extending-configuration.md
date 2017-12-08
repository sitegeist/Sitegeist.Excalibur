# How to extend configuration

You can override the default configuration of all tasks on distribution level and on package level. All you need to
do is to create a file `excalibur.js` either in the root of your Neos distribution or in the root of your site Package.

This file needs to export a JavaScript class. In this class you can define methods that are named after the the task
they want to modify (e.g. `build:js` or `build:css`, just like the script definition in your `package.json`).

Here's an example:

excalibur.js:
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
