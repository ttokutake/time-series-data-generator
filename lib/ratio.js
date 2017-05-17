const Ajv   = require('ajv');
const {Map} = require('immutable');
const is    = require('is_js');

const {randomInt} = require('./random');

class Ratio {
  constructor(param) {
    const mapWithoutUndefined = Ratio.validate(param);
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

  static validate(param) {
    const withoutUndefined = is.json(param) ? Map(param).filter(is.not.undefined).toJSON() : param;
    // NOTICE: keys with "undefined" are not ignored!
    const schema = {
      type                : 'object',
      additionalProperties: {type: 'integer'},
    };
    const ajv     = new Ajv();
    const isValid = ajv.validate(schema, withoutUndefined);
    if (!isValid) {
      throw new Error('1st argument{k_1: v_1, ...} must satisfy any v_i is "null" or "integer"');
    }
    return withoutUndefined;
  }
}

module.exports = Ratio;
