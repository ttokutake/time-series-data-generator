/**
 * Random module.
 * @module lib/random
 */

const is   = require('is_js');
const math = require('mathjs');

/**
 * Sets a random seed.
 * @param {any} v - Any value to seed pseudo random number generation.
 *   Setting null is equals to seeding the pseudo random number generator with a random seed.
 * @example
 * seed(0);
 */
module.exports.seed = (v) => {
  math.config({randomSeed: v});
};

/**
 * Returns a random integer. But returns null if min > mix.
 * @param {integer} min - Lower bound of random integer's range.
 * @param {integer} max - Upper bound of random integer's range.
 * @return {(integer|null)}
 * @example
 * randomInt(0, 5); // => 0 ~ 5
 * randomInt(5, 0); // => null
 */
module.exports.randomInt = (min, max) => {
  if (is.not.integer(min)) {
    throw new Error('1st argument(min) must be integer');
  }
  if (is.not.integer(max)) {
    throw new Error('2nd argument(max) must be integer');
  }

  if (min > max) {
    return null;
  }
  return math.randomInt(min, max + 1);
};
