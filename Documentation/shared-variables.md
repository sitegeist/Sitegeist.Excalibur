# How to share data between CSS, JavaScript and Fusion

If you want to share configuration or variables across CSS, JavaScript and Fusion, you can do so via an
`excalibur.variables.yaml` at the root of your package:

excalibur.variables.yaml:
```yaml
media:
  desktop:
    query: 'screen and max-width'
    min-width: 1024
    max-width: 1920

colors:
  blue: '#00f'
  red: '#f00'
```

The data you've defined here can now be accessed in CSS, JavaScript and Fusion alike.

## Usage in Fusion

If you want to use that data in Fusion, make sure you have the `variableInjection` feature enabled (should be enabled by default):

Settings.yaml:
```yaml
Sitegeist:
  Excalibur:
    features:
      variableInjection:
        enable: true
```

Now you can access the data in Fusion:

Example.fusion:
```fusion
prototype(Some.Vendor:Some.Component) < prototype(Neos.Fusion:Component) {
	renderer = Neos.Fusion:Tag {
		attributes.style = ${'background-color: ' + excalibur.colors.blue}
	}
}
```

If you want to change the `excalibur` context name, you can configure it via Settings:

Settings.yaml:
```yaml
Sitegeist:
  Excalibur:
    features:
      variableInjection:
        contextName: myData
```
Example.fusion:
```fusion
prototype(Some.Vendor:Some.Component) < prototype(Neos.Fusion:Component) {
	renderer = Neos.Fusion:Tag {
		attributes.style = ${'background-color: ' + myData.colors.blue}
	}
}
```

## Usage in CSS

Thanks to to the [postcss-map](https://github.com/pascalduez/postcss-map) plugin, the data can be used in CSS as well. You can access it via the `map` function like this:

button.css:
```css
.button {
	background-color: map(colors, blue);
}

@media map(media, desktop, query) {
	.button {
		background-color: map(colors, red);
	}
}
```

### Why not native CSS variables?

The example above shows, how the data can be used to encapsule media queries. This would be impossible using CSS variables. But you could still utilize CSS variables like this:

```css
:root {
  --colors-blue: map(colors, blue);
  --colors-red: map(colors, red);
}

.button {
	background-color: var(--colors-blue);
}
```

## Usage in JavaScript

The data defined in `excalibur.variables.yaml` is passed as a third parameter to each JavaScript component:

button.js:
```js
export default function button(el, {}, {colors}) {
	el.addEventListener('click', function handleClick() {
		el.style.backgroundColor = colors.red;
	});
}
```
