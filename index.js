const Series = require('./lib/series');

const from     = '2016-01-01T00:00:00Z';
const until    = '2016-01-01T01:00:00Z';
const interval = 5 * 60; // seconds
const series = new Series({from, until, interval});

const coefficient = 1;
const constant    = 0;
const period      = 1 * 60 * 60; // seconds
const series_cos = series.cos({coefficient, constant, period});
console.log(series_cos);
const series_sin = series.sin({coefficient, constant, period});
console.log(series_sin);

const params = {
  rock    : 2,
  scissors: 2,
  paper   : 1,
};
const series_ratio = series.ratio(params);
console.log(series_ratio);
