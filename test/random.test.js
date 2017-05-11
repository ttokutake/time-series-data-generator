const {
  randomInt,
  seed,
} = require('../lib/random');

const faker = require('faker');
const is    = require('is_js');
const jsc   = require('jsverify');

describe('randomInt()', () => {
  test('it should throw Error', () => {
    const inputGenerator = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.string,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => randomInt(input, 0    )).toThrow(/min/);
      expect(() => randomInt(0    , input)).toThrow(/max/);

      return true;
    });
  });

  test('it should return integer between range of min and max', () => {
    jsc.assertForall(jsc.integer, jsc.integer, (x, y) => {
      const [min, max] = x < y ? [x, y] : [y, x];
      const output     = randomInt(min, max);
      return min <= output && output <= max;
    });
  });

  test('it should return null', () => {
    jsc.assertForall(jsc.integer, jsc.integer, (x, y) => {
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
