const Ajv = require('ajv');
const {
  Map,
  Range,
} = require('immutable');
const {jStat} = require('jStat');
const math    = require('mathjs');
const moment  = require('moment');

const {randomInt} = require('./random');
const Ratio       = require('./ratio');

const TYPE_MONOSPACED = 'monospaced';
const TYPE_RANDOM     = 'random';

class Series {
  constructor(options = {}) {
    const now      = moment().startOf('second');
    const defaults = {
      type       : TYPE_MONOSPACED,
      from       : moment(now).subtract(1, 'hour').toISOString(),
      until      : now.toISOString(),
      interval   : 5 * 60, // seconds
      numOfPoints: 10,
      keyName    : 'value',
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type      : 'object',
      properties: {
        type       : {type: 'string', enum: [TYPE_MONOSPACED, TYPE_RANDOM], default: defaults.type},
        from       : {type: ['integer', 'string'], format: 'date-time', default: defaults.from },
        until      : {type: ['integer', 'string'], format: 'date-time', default: defaults.until},
        interval   : {type: 'integer', default: defaults.interval},
        numOfPoints: {type: 'integer', min: 0, default: defaults.numOfPoints},
        keyName    : {type: 'string', default: defaults.keyName},
      },
      additionalProperties: false,
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    this.type        = options.type;
    this.from        = moment(options.from );
    this.until       = moment(options.until);
    this.interval    = moment.duration(options.interval, 'seconds');
    this.numOfPoints = options.numOfPoints;
    this.keyName     = options.keyName;
  }

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
        period       : {type: 'integer', default: defaults.period},
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
    return this._range()
      .map((unix) => {
        const value   = options.coefficient * func(unix * scale) + options.constant;
        const rounded = math.round(value, options.decimalDigits);
        return this._toElem(unix, rounded);
      })
      .toJSON();
  }

  sin(options) {
    return this._trigonometric(Math.sin, options);
  }

  cos(options) {
    return this._trigonometric(Math.cos, options);
  }

  gaussian(options = {}) {
    const defaults = {
      mean         : 10,
      variance     : 1,
      decimalDigits: 2,
    };
    const schema = {
      type      : 'object',
      properties: {
        mean         : {type: 'number', default: defaults.mean},
        variance     : {type: 'number', default: defaults.variance},
        decimalDigits: {type: 'integer', minimum: 0, maximum: 10, default: defaults.decimalDigits},
      },
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    return this._range()
      .map((unix) => {
        const value   = jStat.normal.sample(options.mean, options.variance);
        const rounded = math.round(value, options.decimalDigits);
        return this._toElem(unix, rounded);
      })
      .toJSON();
  }

  ratio(params) {
    const ratio = new Ratio(params);

    return this._range()
      .map((unix) => this._toElem(unix, ratio.sample()))
      .toJSON();
  }

  _range() {
    switch (this.type) {
      case TYPE_MONOSPACED:
        return Range(this.from.unix(), this.until.unix() + 1, this.interval.asSeconds());
      case TYPE_RANDOM:
        const min = this.from .unix();
        const max = this.until.unix();
        return Range(0, this.numOfPoints)
          .map((x) => randomInt(min, max))
          .sort();
      default:
        assert(false);
    }
  }

  _toElem(unix, value) {
    return Map({timestamp: moment(unix * 1000).toISOString()}).set(this.keyName, value).toJSON();
  }
}

module.exports = Series;
