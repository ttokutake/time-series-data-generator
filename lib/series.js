/**
 * Series module.
 * @module lib/series
 */

const Ajv     = require('ajv');
const {Range} = require('immutable');
const is      = require('is_js');
const {jStat} = require('jStat');
const math    = require('mathjs');
const moment  = require('moment');
const R       = require('ramda');

const {randomInt} = require('./random');
const Ratio       = require('./ratio');

/* Enum of Types */
const TYPE_MONOSPACED = 'monospaced';
const TYPE_RANDOM     = 'random';

/**
 * Class generating time series data.
 * @example
 * const from     = '2016-01-01T00:00:00Z';
 * const until    = '2016-01-01T01:00:00Z';
 * const interval = 5 * 60; // seconds
 * const keyName  = 'favorite name';
 * new Series({                    from, until, interval, keyName}); // => Series' instance
 * new Series({type: 'monospaced', from, until, interval, keyName}); // => same as above
 * @example
 * const from      = '2016-01-01T00:00:00Z';
 * const until     = '2016-01-01T01:00:00Z';
 * const numOfData = 5 * 60; // seconds
 * const keyName   = 'favorite name';
 * new Series({type: 'random', from, until, numOfData, keyName}); // => Series' instance
 */
class Series {
  /**
   * Create a series.
   * @param {Object}           [options={}]
   * @param {(integer|string)} [options.type='monospaced']   - 'monospaced' or 'random'.
   * @param {(integer|string)} [options.from=<now - 1 hour>] - Lower bound of date range.
   * @param {string}           [options.until=<now>]         - Upper bound of date range.
   * @param {integer}          [options.interval=5 * 60]     - ('monospaced' only) Intervel of seconds between two data. [1 <= interval]
   * @param {integer}          [options.numOfData=10]        - ('random' only) Number of data. [0 <= numOfData]
   * @param {string}           [options.keyName='value']     - Value's key name of result.
   */
  constructor(options = {}) {
    const now      = moment().startOf('second');
    const defaults = {
      type     : TYPE_MONOSPACED,
      from     : moment(now).subtract(1, 'hour').toISOString(),
      until    : now.toISOString(),
      interval : 5 * 60, // seconds
      numOfData: 10,
      keyName  : 'value',
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type      : 'object',
      properties: {
        type     : {type: 'string', enum: [TYPE_MONOSPACED, TYPE_RANDOM], default: defaults.type},
        from     : {type: ['integer', 'string'], format: 'date-time', default: defaults.from},
        until    : {type: ['integer', 'string'], format: 'date-time', default: defaults.until},
        interval : {type: 'integer', minimum: 1, default: defaults.interval},
        numOfData: {type: 'integer', minimum: 0, default: defaults.numOfData},
        keyName  : {type: 'string', default: defaults.keyName},
      },
      additionalProperties: false,
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    this.type = options.type;
    this.from = is.integer(options.from ) ? moment.unix(options.from ) : moment(options.from );
    this.until = is.integer(options.until) ? moment.unix(options.until) : moment(options.until);
    this.interval = moment.duration(options.interval, 'seconds');
    this.numOfData = options.numOfData;
    this.keyName = options.keyName;
  }

  /**
   * Clone self instance.
   * @param {Object}           [options={}]
   * @param {string}           [options.type=this.type]           - 'monospaced' or 'random'.
   * @param {(integer|string)} [options.from=this.from]           - Lower bound of date range.
   * @param {(integer|string)} [options.until=this.until]         - Upper bound of date range.
   * @param {integer}          [options.interval=this.interval]   - ('monospaced' only) Intervel of seconds between two data. [1 <= interval]
   * @param {integer}          [options.numOfData=this.numOfData] - ('random' only) Number of data. [0 <= numOfData]
   * @param {string}           [options.keyName=this.keyName]     - Value's key name of result.
   * @return {Series}
   * @example
   * new Series().clone({keyName: 'changed name'}); // => Series' instance with keyName 'changed name'
   */
  clone(options = {}) {
    const defaults = {
      type     : this.type,
      from     : this.from .unix(),
      until    : this.until.unix(),
      interval : this.interval.asSeconds(),
      numOfData: this.numOfData,
      keyName  : this.keyName,
    };
    return new Series(is.json(options) ? R.merge(defaults, options) : options);
  }

  /**
   * (Private) Create UNIX timestamps.
   */
  _timestamps() {
    switch (this.type) {
      case TYPE_MONOSPACED: {
        return Range(this.from.unix(), this.until.unix() + 1, this.interval.asSeconds());
      }
      case TYPE_RANDOM: {
        const min = this.from .unix();
        const max = this.until.unix();
        return Range(0, this.numOfData)
          .map(() => randomInt(min, max))
          .sort();
      }
      default: {
        throw Error('Illegal use of Series');
      }
    }
  }

  /**
   * Return time series data by any functions using UNIX timestamp.
   * @param {function} func - (unixTimestamp) => any
   * @return {Array.<{timestamp: string, (string): any}>}
   * @example
   * new Series().generate((unix) => unix); // => [{timestamp: '2017-05-31T02:43:57.000Z', value: 1496198637}, ...]
   */
  generate(func) {
    if (is.not.function(func)) {
      throw new Error('1st argument(func) must be function');
    }
    return this._timestamps()
      .map((unix) => R.assoc(this.keyName, func(unix), {timestamp: moment.unix(unix).toISOString()}))
      .toJSON();
  }

  /**
   * (Private) Return time series data by trigonometric functions.
   */
  _trigonometric(func, options = {}) {
    const defaults = {
      coefficient  : 1.0,
      constant     : 0.0,
      decimalDigits: 2,
      period       : 1 * 60 * 60, // seconds
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type      : 'object',
      properties: {
        coefficient  : {type: 'number' , default: defaults.coefficient},
        constant     : {type: 'number' , default: defaults.constant},
        decimalDigits: {type: 'integer', minimum: 0, maximum: 10, default: defaults.decimalDigits},
        period       : {type: 'integer', minimum: 1, default: defaults.period},
      },
      additionalProperties: false,
    }
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    const scale = 2 * Math.PI / options.period;
    return this.generate((unix) => {
      const value = options.coefficient * func(unix * scale) + options.constant;
      return math.round(value, options.decimalDigits);
    });
  }

  /**
   * Return time series data describing sine curve.
   * @param {Object}  [options={}]
   * @param {number}  [options.coefficient=1.0]    - Coefficient of sine curve.
   * @param {number}  [options.constant=0.0]       - Constant of sine curve.
   * @param {integer} [options.decimalDigits=2]    - Number of decimal places. [0 <= decimalDigits <= 10]
   * @param {integer} [options.period=1 * 60 * 60] - Period of sine curve. [1 <= period]
   * @return {Array.<{timestamp: string, (string): number}>}
   * @example
   * const coefficient   = 1;
   * const constant      = 1;
   * const decimalDigits = 3;
   * const period        = 1 * 60 * 60; // seconds
   * new Series().sin({coefficient, constant, decimalDigits, period})); // => [{timestamp: '2017-05-31T02:17:23.000Z', value: 1.969}, ...]
   */
  sin(options) {
    return this._trigonometric(Math.sin, options);
  }

  /**
   * Return time series data describing cosine curve.
   * @param {Object}  [options={}]
   * @param {number}  [options.coefficient=1.0]    - Coefficient of cosine curve.
   * @param {number}  [options.constant=0.0]       - Constant of cosine curve.
   * @param {integer} [options.decimalDigits=2]    - Number of decimal places. [0 <= decimalDigits <= 10]
   * @param {integer} [options.period=1 * 60 * 60] - Period of cosine curve. [1 <= period]
   * @return {Array.<{timestamp: string, (string): number}>}
   * @example
   * const coefficient   = 1;
   * const constant      = 1;
   * const decimalDigits = 3;
   * const period        = 1 * 60 * 60; // seconds
   * new Series().cos({coefficient, constant, decimalDigits, period})); // => [{timestamp: '2017-05-31T02:20:48.000Z', value: 0.429}, ...]
   */
  cos(options) {
    return this._trigonometric(Math.cos, options);
  }

  /**
   * Return time series data by normal distribution.
   * @param {Object}  [options={}]
   * @param {number}  [options.mean=10]         - Mean of normal distribution.
   * @param {number}  [options.variance=1]      - Variance of normal distribution.
   * @param {integer} [options.decimalDigits=2] - Number of decimal places. [0 <= decimalDigits <= 10]
   * @return {Array.<{timestamp: string, (string): number}>}
   * @example
   * const mean          = 5;
   * const variance      = 1.5;
   * const decimalDigits = 3;
   * new Series().gaussian({mean, variance, decimalDigits}); // => [{timestamp: '2017-05-31T02:25:38.000Z', value: 2.56}, ...]
   */
  gaussian(options = {}) {
    const defaults = {
      mean         : 10.0,
      variance     : 1.0,
      decimalDigits: 2,
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type      : 'object',
      properties: {
        mean         : {type: 'number', default: defaults.mean},
        variance     : {type: 'number', default: defaults.variance},
        decimalDigits: {type: 'integer', minimum: 0, maximum: 10, default: defaults.decimalDigits},
      },
      additionalProperties: false,
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    return this.generate(() => {
      const value = jStat.normal.sample(options.mean, options.variance);
      return math.round(value, options.decimalDigits);
    });
  }

  /**
   * Return time series data by ratio.
   * @param {Object.<string, integer>} params - Map representing pairs of key and weight.
   * @return {Array.<{timestamp: string, (string): string}>}
   * @example
   * const params = {
   *   rock    : 1,
   *   scissors: 2,
   *   paper   : 1,
   * };
   * new Series().ratio(params); // => [{timestamp: '2017-05-31T02:30:25.000Z', value: 'rock'}, ...]
   */
  ratio(params) {
    const ratio = new Ratio(params);
    return this.generate(() => ratio.sample());
  }
}

module.exports = Series;
