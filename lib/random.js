const faker = require('faker');
const is    = require('is_js');

function seed(v) {
  faker.seed(v);
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
  return faker.random.number() % (max + 1 - min) + min;
}

module.exports = {
  randomInt,
  seed,
};
