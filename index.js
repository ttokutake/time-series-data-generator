const Series = require('./lib/series');

const from     = '2016-01-01T00:00:00Z';
const until    = '2016-01-01T01:00:00Z';
const interval = 5 * 60; // seconds
const series = new Series({from, until, interval});

var coefficient = 1;
var constant    = 0;
var period      = 1 * 60 * 60; // seconds
const series_cos = series.cos({coefficient, constant, period});
console.log(series_cos);
const series_sin = series.sin({coefficient, constant, period});
console.log(series_sin);
