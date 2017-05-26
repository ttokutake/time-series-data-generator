const Series = require('./lib/series');

const from     = '2016-01-01T00:00:00Z';
const until    = '2016-01-01T01:00:00Z';
const interval = 5 * 60; // seconds
const series = new Series({from, until, interval, keyName: 'monospaced'});

const coefficient   = 1;
const constant      = 0;
const decimalDigits = 3;
const period        = 1 * 60 * 60; // seconds
console.log(series.cos({coefficient, constant, decimalDigits, period}));
console.log(series.sin({coefficient, constant, decimalDigits, period}));

const params = {
  rock    : 2,
  scissors: 2,
  paper   : 1,
};
console.log(series.ratio(params));

const numOfPoints = 10;
const series_random = new Series({type: 'random', from, until, numOfPoints, keyName: 'random'});
console.log(series_random.ratio(params, {keyName: 'light'}));

console.log(series.gaussian());
