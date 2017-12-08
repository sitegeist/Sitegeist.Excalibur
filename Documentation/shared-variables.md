# How to share variables between CSS, JavaScript and PHP

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

button.js:
```js
export default function button(el, {}, {colors}) {
	el.addEventListener('click', function handleClick() {
		el.style.backgroundColor = colors.red;
	});
}
```
