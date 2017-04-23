const {
  randomInt,
} = require('../lib/random');

const {Range} = require('immutable');

test('randomInt() should return integer between range of min and max', () => {
  const numOfTrails = 10;
  const inputs      = [
    [-2, -1],
    [-1, -1],
    [-1,  0],
    [-1,  1],
    [ 0,  0],
    [ 0,  1],
    [ 1,  1],
    [ 1,  2],
  ];

  Range(1, numOfTrails).forEach((_) => {
    for ([min, max] of inputs) {
      const result = randomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });
});

test('randomInt() should return null', () => {
  const inputs = [
    [-1, -2],
    [ 0, -1],
    [ 1, -1],
    [ 1,  0],
    [ 2,  1],
  ];

  for ([min, max] of inputs) {
    expect(randomInt(min, max)).toBeNull();
  }
});

test('randomInt() should throw Error', () => {
  const inputs = [
    undefined,
    null,
    '0',
    [],
    {},
  ];

  for (input of inputs) {
    expect(() => randomInt(input, 0    )).toThrow(/min/);
    expect(() => randomInt(0    , input)).toThrow(/max/);
  }
});
