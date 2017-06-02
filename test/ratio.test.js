const Ratio = require('../lib/ratio');

const is  = require('is_js');
const jsc = require('jsverify');
const R   = require('ramda');

const {
  jscPosInteger,
  jscNonPosInteger,
} = require('./util');

describe('Ratio', () => {
  test('constructor() should throw Error', () => {
    const inputs = [
      null,
      false,
      0,
      0.1,
      '',
      [],
      () => {},

      {key: null},
      {key: false},
      {key: 0.1},
      {key: ''},
      {key: []},
      {key: {}},
      {key: () => {}},
    ];

    for (const input of inputs) {
      expect(() => new Ratio(input)).toThrow(/params/);
    }
  });

  test('sample() should return some key', () => {
    jsc.assertForall(jsc.dict(jscPosInteger), (input) => {
      if (is.empty(input)) {
        return true;
      }

      const candidates = R.keys(input);
      const output     = new Ratio(input).sample();
      return candidates.includes(output);
    });
  });

  test('sample() should return null', () => {
    const inputGenerator = jsc.dict(jsc.oneof([jsc.constant(undefined), jscNonPosInteger]));

    jsc.assertForall(inputGenerator, (input) => {
      const output = new Ratio(input).sample();
      return is.null(output);
    });
  });

  test('sample() should return some key whose "ratio" is not 0', () => {
    const inputGenerator = jsc.record({
      selected      : jscPosInteger,
      'non-selected': jsc.oneof([jsc.constant(undefined), jscNonPosInteger]),
    });

    jsc.assertForall(inputGenerator, (input) => {
      const output = new Ratio(input).sample();
      return output === 'selected';
    });
  });

  test('this.ranges should be range expression', () => {
    const data = [
      [{a: 1}, {a: [1, 1]} ],
      [{a: 1, b: 0}, {a: [1, 1]} ],
      [{a: 1, b: 1}, {a: [1, 1], b: [2, 2]}],
      [{a: 2, b: 1}, {a: [1, 2], b: [3, 3]}],
      [{a: 1, b: 2}, {a: [1, 1], b: [2, 3]}],
    ];

    for (const [ratio, expected] of data) {
      const ratioMap = new Ratio(ratio);
      expect(ratioMap.ranges.toJSON()).toEqual(expected);
    }
  });

  test('this.max should be max of range expression', () => {
    const data = [
      [{a: 1}, 1],
      [{a: 1, b: 0}, 1],
      [{a: 1, b: 1}, 2],
      [{a: 2, b: 1}, 3],
      [{a: 1, b: 2}, 3],
    ];

    for (const [ratio, expected] of data) {
      const ratioMap = new Ratio(ratio);
      expect(ratioMap.max).toEqual(expected);
    }
  });
});
