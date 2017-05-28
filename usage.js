const Series = require('./lib/series');


console.log('+-------------------------+');
console.log("| Create Series' instance |");
console.log('+-------------------------+');
const from      = '2016-01-01T00:00:00Z';
const until     = '2016-01-01T01:00:00Z';
const interval  = 5 * 60; // seconds
const numOfData = 10;
const series         = new Series({type: 'monospaced', from, until, interval , keyName: 'key-name-of-value'});
const seriesByRandom = new Series({type: 'random'    , from, until, numOfData, keyName: 'put-one-you-want' });

console.log('\n');


console.log('+-----------------------------------------------------------------+');
console.log('| Output "trigonometric" time series data with a certain interval |');
console.log('+-----------------------------------------------------------------+');
const coefficient   = 1;
const constant      = 1;
const decimalDigits = 3;
const period        = 1 * 60 * 60; // seconds
console.log('/* sin() */');
console.log(series.sin({coefficient, constant, decimalDigits, period}));
console.log('/* cos() */');
console.log(series.cos({coefficient, constant, decimalDigits, period}));

console.log('\n');


console.log('+---------------------------------------------------------------------------------+');
console.log('| Output "gaussian"(normal distribution) time series data with a certain interval |');
console.log('+---------------------------------------------------------------------------------+');
const mean          = 5;
const variance      = 1.5;
// const decimalDigits = 3;
console.log(series.gaussian({mean, variance, decimalDigits}));

console.log('\n');


console.log('+---------------------------------------------------------+');
console.log('| Output "ratio" time series data with a certain interval |');
console.log('+---------------------------------------------------------+');
const params = {
  rock    : 1,
  scissors: 2,
  paper   : 1,
};
console.log(series.ratio(params));

console.log('\n');


console.log('+------------------------------------------------------+');
console.log('| Output "ratio" time series data with random interval |');
console.log('+------------------------------------------------------+');
console.log(seriesByRandom.ratio(params));
