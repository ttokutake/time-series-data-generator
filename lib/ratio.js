const Ajv   = require('ajv');
const {Map} = require('immutable');
const is    = require('is_js');

const {randomInt} = require('./random');

class Ratio {
  constructor(params) {
    const mapWithoutUndefined = Ratio.validate(params);
    this.map = Map(mapWithoutUndefined);

    [this.ranges, this.max] = this.map
      .filter((v) => v > 0)
      .reduce(([map, sum], v, k) => {
        const upper = sum + v;
        return [map.set(k, [sum + 1, upper]), upper];
      }, [Map(), 0]);
  }

  sample() {
    const sample = randomInt(1, this.max);
    const key    = this.ranges.findKey(([lower, upper]) => lower <= sample && sample <= upper);
    return is.existy(key) ? key : null;
  }

  static validate(params) {
    const withoutUndefined = is.json(params) ? Map(params).filter(is.not.undefined).toJSON() : params;
    // NOTICE: keys with "undefined" are not ignored by this schema!
    const schema = {
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
