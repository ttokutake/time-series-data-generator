/**
 * Random module.
 * @module lib/random
 */

const is   = require('is_js');
const math = require('mathjs');

/**
 * Set a random seed.
 * @param {*} v - value to seed pseudo random number generation
 * @returns {undefined}
 */
function seed(v) {
  math.config({randomSeed: v});
}

/**
 * Return a random integer number satisfying min <= x <= max.
 * @param {number} min - lower bound of random integer
 * @param {number} max - upper bound of random integer
 * @returns {number}
 */
function randomInt(min, max) {
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
}

module.exports = {
  randomInt,
  seed,
};
