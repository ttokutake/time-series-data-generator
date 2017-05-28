# time-series-data-generator

Generate time series data for developers!

## Installation

Following example uses [yarn](https://yarnpkg.com/lang/en/), but you can also use [npm](https://www.npmjs.com/).

```bash
$ npm install -g yarn
$ yarn add https://github.com/ttokutake/time-series-data-generator
```

## Get started

1. Use simply. This generator outputs sine curve values with timestamps from "now - 1 hour" until now at 5 min interval.

  ```js
  const Series = require('time-series-data-generator');
  
  const series = new Series();
  console.log(series.sin());
  // => [{ timestamp: '2017-05-28T03:34:31.000Z', value: -0.46 }, { timestamp: '2017-05-28T03:39:31.000Z', value: -0.84 }, ...]
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
  // => [{ timestamp: '2016-01-01T00:00:00.000Z', 'key-name-of-value': 0 }, { timestamp: '2016-01-01T00:05:00.000Z', 'key-name-of-value': 0.5 }, ...]
  ```
  
3. Output data with "random" timestamps.

  ```js
  const Series = require('time-series-data-generator');
  
  const from      = '2016-01-01T00:00:00Z';
  const until     = '2016-01-01T01:00:00Z';
  const numOfData = 10;
  const series = new Series({type: 'random', from, until, numOfData});
  console.log(series.sin());
  // => [{ timestamp: '2016-01-01T00:01:43.000Z', value: 0.18 }, { timestamp: '2016-01-01T00:02:19.000Z', value: 0.24 }, ...]
  ```

## APIs

```
Series
  - constructor(options)
    - options: Object {
      type     : 'monospaced' or 'random'                                        , // default 'monospaced'
      from     : Integer(UNIX timestamp without milliseconds) or String(RFC 3339), // default now - 1 hour
      until    : Integer(UNIX timestamp without milliseconds) or String(RFC 3339), // default now
      interval : Positive Integer(seconds)                                       , // default 5 * 60
      numOfData: Non Negative Integer                                            , // default 10
      keyName  : String                                                          , // default 'value'
    }
  - sin(options)
  - cos(options)
  - gaussian(options)
  - ratio(params)
  - generate(function)
```
