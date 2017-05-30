const Ajv   = require('ajv');
const {Map} = require('immutable');
const is    = require('is_js');
const R     = require('ramda');

const {randomInt} = require('./random');

class Ratio {
  constructor(params) {
    this.map = Ratio.validate(params);

    [this.ranges, this.max] = Map(this.map)
      .filter((v) => v > 0)
      .reduce(([map, sum], v, k) => {
        const upper = sum + v;
        return [map.set(k, [sum + 1, upper]), upper];
      }, [Map(), 0]);
  }

  sample() {
    const num = randomInt(1, this.max);
    const key = this.ranges.findKey(([lower, upper]) => lower <= num && num <= upper);
    return is.existy(key) ? key : null;
  }

  static validate(params) {
    const withoutUndefined = is.json(params) ? R.reject(is.undefined, params) : params;
    // NOTICE: keys with "undefined" are not ignored by this schema!
    const schema = {
      $schema             : 'http://json-schema.org/schema#',
      type                : 'object',
      additionalProperties: {type: 'integer'},
    };
    const ajv     = new Ajv();
    const isValid = ajv.validate(schema, withoutUndefined);
    if (!isValid) {
      const error = ajv.errors[0];
      throw new Error(`params${error.dataPath} ${error.message}`);
    }
    return withoutUndefined;
  }
}

module.exports = Ratio;
