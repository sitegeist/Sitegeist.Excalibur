const chalk = require('chalk');

const messages = [
	'In the end, everything will be okay. If it\'s not okay, it\'s not yet the end.',
	'The difficulties of life are intended to make us better, not bitter.',
	'When life gives you a hundred reasons to cry, show life that you have a thousand reasons to smile.',
	'One minute of patience, ten years of peace.',

	'"In the end, it\'s not the years in your life that count. It\'s the life in your years." Abraham Lincoln',
	'"Patience is necessary, and one cannot reap immediately where one has sown." Soren Kierkegaard',
	'"There is more to life than increasing its speed." Mahatma Gandhi',
	'"In three words I can sum up everything I\'ve learned about life: it goes on." Robert Frost',
	'"Patience is bitter, but its fruit is sweet." Jean-Jacques Rousseau',
	'"He that can have patience can have what he will." Benjamin Franklin',
	'"All human wisdom is summed up in two words – wait and hope." Alexandre Dumas Père'
];

module.exports = api => func => {
	if (!api.argv.p && !api.argv.production) {
		const log = () => api.logger.message(
			'ᗄ',
			`Hang in there! ${messages[Math.floor(Math.random() * messages.length)]}`,
			chalk.gray
		);
		const hangInThereInterval = setInterval(log, 7000);

		return (...args) => {
			clearInterval(hangInThereInterval);
			func(...args);
		};
	}

	return func;
};
