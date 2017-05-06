const {
  randomInt,
  seed,
} = require('../lib/random');

const faker = require('faker');
const is    = require('is_js');
const jsc   = require('jsverify');

const {TypeBasis} = require('./util');

describe('randomInt()', () => {
  test('it should throw Error', () => {
    const inputs = new TypeBasis().withoutInteger().get();

    for (const input of inputs) {
      expect(() => randomInt(input, 0    )).toThrow(/min/);
      expect(() => randomInt(0    , input)).toThrow(/max/);
    }
  });

  test('it should return integer between range of min and max', () => {
    jsc.assertForall(jsc.integer(), jsc.integer(), (x, y) => {
      const [min, max] = x < y ? [x, y] : [y, x];
      const output     = randomInt(min, max);
      return min <= output && output <= max;
    });
  });

  test('it should return null', () => {
    jsc.assertForall(jsc.integer(), jsc.integer(), (x, y) => {
      if (x === y) {
        return true;
      }
      const [min, max] = x < y ? [y, x] : [x, y];
      const output     = randomInt(min, max);
      return is.null(output);
    });
  });
});

test('seed() should fix random number table', () => {
  seed(1);
  expect(randomInt(0, 1000)).toBe(417);
});
