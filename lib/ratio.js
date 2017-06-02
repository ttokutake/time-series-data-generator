/**
 * Ratio module.
 * @module lib/ratio
 */

const Ajv   = require('ajv');
const {Map} = require('immutable');
const is    = require('is_js');
const R     = require('ramda');

const {randomInt} = require('./random');

/**
 * Class sampling keys based on ratio.
 * @example
 * new Ratio({key1: 1, key2: 2}); // => Ratio's instance
 */
class Ratio {
  /**
   * Create a ratio.
   * @param {Object.<string, integer>} params - Map representing pairs of key and weight.
   */
  constructor(params) {
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

    this.map = withoutUndefined;
    [this.ranges, this.max] = Map(withoutUndefined)
      .filter((v) => v > 0)
      .reduce(([map, sum], v, k) => {
        const upper = sum + v;
        return [map.set(k, [sum + 1, upper]), upper];
      }, [Map(), 0]);
  }

  /**
   * Sample a key based on ratio.
   * @return {(string|null)}
   * @example
   * new Ratio({key1: 1, key2: 2}).sample(); // => "key1" with a third, or "key2" with two third
   */
  sample() {
    const num = randomInt(1, this.max);
    const key = this.ranges.findKey(([lower, upper]) => lower <= num && num <= upper);
    return is.existy(key) ? key : null;
  }
}

module.exports = Ratio;
