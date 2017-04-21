const F = require('faker');

const {isNotNumber} = require('./type');

function seed(v) {
  F.seed(v);
}

function randomInt(min, max) {
  if (isNotNumber(min)) {
    throw new Error('1st argument(min) must be "Number"');
  }
  if (isNotNumber(max)) {
    throw new Error('2nd argument(max) must be "Number"');
  }

  min = Math.floor(min);
  max = Math.floor(max);

  if (min > max) {
    return null;
  }
  return F.random.number() % (max + 1 - min) + min;
}

module.exports = {
  randomInt,
  seed,
};
