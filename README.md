# time-series-data-generator

[![Build Status](https://travis-ci.org/ttokutake/time-series-data-generator.svg?branch=master)](https://travis-ci.org/ttokutake/time-series-data-generator)
[![Coverage Status](https://coveralls.io/repos/github/ttokutake/time-series-data-generator/badge.svg?branch=master)](https://coveralls.io/github/ttokutake/time-series-data-generator?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ttokutake/time-series-data-generator.svg)](https://greenkeeper.io/)

Generate time series data for development!

## Installation

Following example uses [yarn](https://yarnpkg.com/lang/en/), but you can also use [npm](https://www.npmjs.com/).

```bash
$ npm install -g yarn
$ yarn add https://github.com/ttokutake/time-series-data-generator
```

## Getting started

1. Use simply. This generator outputs sine curve values with timestamps from "now - 1 hour" until now at 5 min interval.

  ```js
  const Series = require('time-series-data-generator');

  const series = new Series();
  console.log(series.sin());
  // => [{timestamp: '2017-05-28T03:34:31.000Z', value: -0.46}, {timestamp: '2017-05-28T03:39:31.000Z', value: -0.84}, ...]
  ```

2. Use with options.

  ```js
  const Series = require('time-series-data-generator');

  const from     = '2016-01-01T00:00:00Z';
  const until    = '2016-01-01T01:00:00Z';
  const interval = 5 * 60; // seconds
  const keyName  = 'key-name-of-value';
  const series = new Series({from, until, interval, keyName});
  console.log(series.sin());
  // => [{timestamp: '2016-01-01T00:00:00.000Z', 'key-name-of-value': 0}, {timestamp: '2016-01-01T00:05:00.000Z', 'key-name-of-value': 0.5}, ...]
  ```

3. Output data with "random" timestamps.

  ```js
  const Series = require('time-series-data-generator');

  const from      = '2016-01-01T00:00:00Z';
  const until     = '2016-01-01T01:00:00Z';
  const numOfData = 10;
  const series = new Series({type: 'random', from, until, numOfData});
  console.log(series.sin());
  // => [{timestamp: '2016-01-01T00:01:43.000Z', value: 0.18}, {timestamp: '2016-01-01T00:02:19.000Z', value: 0.24}, ...]
  ```

## Examples for each APIs

- `sin()`: Describing sine curve.
  ```js
  const Series = require('time-series-data-generator');

  const series = new Series();
  console.log(series.sin());
  // => [{timestamp: '2017-05-31T02:17:23.000Z', value: 0.97}, {imestamp: '2017-05-31T02:22:23.000Z', value: 0.72}, ...]

  const coefficient   = 1;
  const constant      = 1;
  const decimalDigits = 3;
  const period        = 1 * 60 * 60; // seconds
  console.log(series.sin({coefficient, constant, decimalDigits, period}));
  // => [{timestamp: '2017-05-31T02:17:23.000Z', value: 1.969}, {timestamp: '2017-05-31T02:22:23.000Z', value: 1.716}, ...]

  ```
- `cos()`: Describing cosine curve.
  ```js
  const Series = require('time-series-data-generator');

  const series = new Series();
  console.log(series.cos());
  // => [{timestamp: '2017-05-31T02:20:48.000Z', value: -0.57}, {timestamp: '2017-05-31T02:25:48.000Z', value: -0.9}, ...]

  const coefficient   = 1;
  const constant      = 1;
  const decimalDigits = 3;
  const period        = 1 * 60 * 60; // seconds
  console.log(series.cos({coefficient, constant, decimalDigits, period}));
  // => [{timestamp: '2017-05-31T02:20:48.000Z', value: 0.429}, {timestamp: '2017-05-31T02:25:48.000Z', value: 0.095}, ...]

  ```
- `gaussian()`: Plotting numbers with normal distribution.
  ```js
  const Series = require('time-series-data-generator');

  const series = new Series();
  console.log(sereis.gaussian());
  // => [{timestamp: '2017-05-31T02:25:38.000Z', value: 10.15}, {timestamp: '2017-05-31T02:30:38.000Z', value: 9.68}, ...]

  const mean          = 5;
  const variance      = 1.5;
  const decimalDigits = 3;
  console.log(series.gaussian({mean, variance, decimalDigits}));
  // => [{timestamp: '2017-05-31T02:25:38.000Z', value: 2.56}, {timestamp: '2017-05-31T02:30:38.000Z', value: 5.924}, ...]

  ```
- `ratio()`: Sampling strings following theirs weights.
  ```js
  const Series = require('time-series-data-generator');

  const series = new Series({type: 'random'});
  const params = {
    rock    : 1,
    scissors: 2,
    paper   : 1,
  };
  console.log(series.ratio(params));
  // => [{timestamp: '2017-05-31T02:30:25.000Z', value: 'rock'}, {timestamp: '2017-05-31T02:37:31.000Z', value: 'scissors'}, ...]

  ```
- `generate()`: General function.
  ```js
  const Series = require('time-series-data-generator');

  const series = new Series({type: 'random'});
  console.log(series.generate((unix) => unix));
  // => [{timestamp: '2017-05-31T02:43:57.000Z', value: 1496198637}, {timestamp: '2017-05-31T02:53:07.000Z', value: 1496199187}, ...]
  ```

## API document

https://ttokutake.github.io/time-series-data-generator/
