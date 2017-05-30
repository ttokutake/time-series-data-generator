const is   = require('is_js');
const math = require('mathjs');

/**
 * set a random seed.
 * @param v - value to seed pseudo random number generation.
 */
function seed(v) {
  math.config({randomSeed: v});
}

/**
 * return a random integer
 * @param {integer} min - lower bound of random integer's range.
 * @param {integer} max - upper bound of random integer's range.
 * @return {integer}
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
