const Ajv = require('ajv');
const is  = require('is_js');
const R   = require('ramda');

const {randomInt} = require('./random');

class Ratio {
  constructor(params) {
    this.map                = Ratio.validate(params);
    [this.ranges, this.max] = R.pipe(
      R.filter((v) => v > 0),
      R.toPairs,                           // NOTICE: Cannot use R.reduce() for Object!
      R.reduce(([pairs, sum], [k, v]) => {
        const upper = sum + v;
        return [R.append([[sum + 1, upper], k], pairs), upper];
      }, [[], 0])
    )(this.map);
  }

  sample() {
    const num    = randomInt(1, this.max);
    const sample = R.find(([[lower, upper], _]) => lower <= num && num <= upper, this.ranges);
    return is.existy(sample) ? sample[1] : null;
  }

  static validate(params) {
    const withoutUndefined = is.json(params) ? R.reject(is.undefined, params) : params;
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
