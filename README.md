# Sitegeist.Excalibur

> An opinionated frontend build framework tailored to work with Neos and Atomic.Fusion

### Authors & Sponsors

* Wilhelm Behncke - behncke@sitegeist.de

*The development and the public-releases of this package is generously sponsored
by our employer http://www.sitegeist.de.*

## Why?

bundling and transpiling javascript and css code.
In many cases a lot of time needs to be spent on configuration and boilerplate code - most of which is going to be
copy&pasted from another project, thus defeating any version control.

So, we needed a system with batteries included, but easily replaceable - just like Neos itself.

The result is Sitegeist.Monocle - an opinionated build framework based on webpack and postcss that is now used across all of our Neos projects.

It is supposed to work out of the box and with zero-configuration in most cases.

## Installation & first steps

First, install Sitegeist.Excalibur via composer:

```sh
composer install sitegeist/excalibur
```

Afterwards, add the associated JavaScript dependency to your `package.json`:

```sh
yarn add file:Packages/Application/Sitegeist.Excalibur/
```

## Usage

Sitegeist.Excalibur expects to be run as an npm or yarn script. All you need to do is to apply the `sitegeist-excalibur` binary to a given script name and then Sitegeist.Excalibur will figure out the rest.

Have a look at the following links for more info on npm and yarn scripts:
* https://yarnpkg.com/lang/en/docs/package-json/#toc-scripts
* https://docs.npmjs.com/misc/scripts

Here's an example for the `build:js` task:

```json
{
	"scripts": {
		"build:js": "sitegeist-excalibur"
	}
}
```

Now you can start Sitegeist.Excalibur with the following command:

```sh
yarn build:js
```

The same principle applies of course for other build tasks:

```json
{
	"scripts": {
		"build:js": "sitegeist-excalibur",
		"build:css": "sitegeist-excalibur"
	}
}
```

To build your css just run:

```sh
yarn build:css
```

In many cases you don't want to run just those single task, but all tasks that belong together. In that case, just create another script that contains just the prefix `build`:

```json
{
	"scripts": {
		"build": "sitegeist-excalibur",
		"build:js": "sitegeist-excalibur",
		"build:css": "sitegeist-excalibur"
	}
}
```

And then you can build your JavaScript and your css simulateously with:

```sh
yarn build
```

Note: `build` will only run those `build:*` tasks, that have been explicitly configured as a script.

If you want to start a build every time a file changes, just add a `watch:*` prefix to the script:

```json
{
	"scripts": {
		"watch:build": "sitegeist-excalibur",
		"watch:build:js": "sitegeist-excalibur",
		"watch:build:css": "sitegeist-excalibur"
	}
}
```

```sh
yarn watch
```

Note: `watch:build` will only run those `watch:build:*` tasks, that have been explicitly configured as a script.

## File structure

We strongly encourage to use this file structure for all your components:

```
Packages/Sites/Vendor.SitePackage
└── Resources/Private/Fusion
	├── Root.fusion
	└── Presentation
		└── Component
		    └── MyComponent
			    ├── MyComponent.fusion
				├── MyComponent.css
				└── MyComponent.js
```

Apart from the `Presentation` directory, every part of the directory path to a fusion file must be represented in that file's prototype name, like:

```fusion
prototype(Vendor.SitePackage:Component.MyComponent)
```

Sitegeist.Excalibur will however also work with the following structure:

```
Packages/Sites/Vendor.SitePackage
└── Resources/Private/Fusion
	├── Root.fusion
	└── Component
	    └── MyComponent
		    ├── MyComponent.fusion
			├── MyComponent.css
			└── MyComponent.js
```

You can also give your files generic names like `index.fusion`, but it is important that your \*.fusion and \*.(css|js) files are named similarly.

```
Packages/Sites/Vendor.SitePackage
└── Resources/Private/Fusion
	├── Root.fusion
	└── Component
	    └── MyComponent
		    ├── index.fusion
			├── index.css
			└── index.js
```

To ensure a working structure, have a look at:

https://github.com/sitegeist/Sitegeist.NeosGuidelines

## Automatic intialization of JavaScript

Sitegeist.Excalibur ships with a fusion prototype called `Sitegeist.Excalibur:JavaScriptComponentWrapping`. At can be applied to other fusion prototypes similar to `Neos.Neos:ContentElementWrapping`:

```fusion
prototype(Vendor.SitePackage:MyPrototype) {
	@process.javascript = Sitegeist.Excalibur:JavaScriptComponentWrapping
}
```

In case, you are using Atomic.Fusion, make sure to apply the prototype to the `renderer` of your component:

```fusion
prototype(Vendor.SitePackage:Component.MyComponent) < prototype(PackageFactory.AtomicFusion:Component) {
	renderer.@process.javascript = Sitegeist.Excalibur:JavaScriptComponentWrapping
}
```

After applying this prototype, the Sitegeist.Excalibur runtime will automaically discover your component on the page and initialize the associated javascript on it.

Therefore, your javascript **must** always export a function like this:

```js
export default (el, props) => {

};
```

`el` is the outermost DOM element of your component.

`props` contains all props that have been passed to your component.

## Overriding configuration

## browserlist support

## jest helpers

Originally, Sitegeist.Excalibur was supposed to ship with an abstraction of facebook's jest as well. But since jest has a pretty similar philosophy, it was obvious that we couldn't create a more comfortable experience without unecessarily increasing complexity.

So, if you're going to write frontend tests, we strongly encourage you to just install jest alongside Sitegeist.Excalibur and let it do it's magic :)

Sitgeist.Excalibur does provide a little help though. If you are using jest to test your frontend and Sitegeist.Monocle to develop it withing a living styleguide environment, then you can use Sitegeist.Excalibur's jest helpers to render components individually.
