const is   = require('is_js');
const math = require('mathjs');

function seed(v) {
  math.config({randomSeed: v});
}

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
