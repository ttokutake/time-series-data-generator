const faker = require('faker');
const is    = require('is_js');

function seed(v) {
  faker.seed(v);
}

function randomInt(min, max) {
  if (is.not.number(min)) {
    throw new Error('1st argument(min) must be "Number"');
  }
  if (is.not.number(max)) {
    throw new Error('2nd argument(max) must be "Number"');
  }

  min = Math.floor(min);
  max = Math.floor(max);

  if (min > max) {
    return null;
  }
  return faker.random.number() % (max + 1 - min) + min;
}

module.exports = {
  randomInt,
  seed,
};
