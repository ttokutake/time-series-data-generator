const Ajv = require('ajv');
const {
  Map,
  OrderedMap,
  Range,
} = require('immutable');
const math   = require('mathjs');
const moment = require('moment');

const Ratio = require('./ratio');

class Series {
  constructor(options = {}) {
    const now      = moment().startOf('second');
    const defaults = {
      from    : moment(now).subtract(1, 'hour').toISOString(),
      until   : now.toISOString(),
      interval: 1 * 60, // seconds
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type      : 'object',
      properties: {
        from    : {type: ['integer', 'string'], format: 'date-time', default: defaults.from },
        until   : {type: ['integer', 'string'], format: 'date-time', default: defaults.until},
        interval: {type: 'integer', default: defaults.interval},
      },
      additionalProperties: false,
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    this.from     = moment(options.from );
    this.until    = moment(options.until);
    this.interval = moment.duration(options.interval, 'seconds');
  }

  _range() {
    return Range(this.from.unix(), this.until.unix() + 1, this.interval.asSeconds());
  }

  _trigonometric(func, options = {}) {
    const defaults = {
      keyName: 'value',

      coefficient: 1.0,
      constant   : 0.0,
      period     : 1 * 60 * 60, // seconds
    };
    const schema = {
      $schema   : 'http://json-schema.org/schema#',
      type: 'object',
      properties: {
        keyName: {type: 'string', default: defaults.keyName},

        coefficient: {type: 'number', default: defaults.coefficient},
        constant   : {type: 'number', default: defaults.constant   },
        period     : {type: 'integer', default: defaults.period},
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
      .reduce((map, t) => map.set(moment(t * 1000).toISOString(), func(t * scale)), OrderedMap())
      .map((v) => options.coefficient * v + options.constant)
      .map((v) => math.round(v, 2))
      .map((v, t) => {
        return Map({timestamp: t}).set(options.keyName, v);
      })
      .toList()
      .toJS();
  }

  cos(options) {
    return this._trigonometric(Math.cos, options);
  }

  sin(options) {
    return this._trigonometric(Math.sin, options);
  }

  ratio(params, options = {}) {
    const ratio = new Ratio(params);
    const schema = {
      type      : 'object',
      properties: {
        keyName: {type: 'string', default: 'value'},
      },
      additionalProperties: false,
    };
    const ajv     = new Ajv({useDefaults: true});
    const isValid = ajv.validate(schema, options);
    if (!isValid) {
      const error = ajv.errors[0];
      throw Error(`options${error.dataPath} ${error.message}`);
    }

    return this._range()
      .map((t) => {
        return Map({timestamp: moment(t * 1000).toISOString()}).set(options.keyName, ratio.sample());
      })
      .toJS();
  }
}

module.exports = Series;
