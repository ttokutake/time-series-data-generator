const RatioMap = require('../lib/ratio_map');

const {Map} = require('immutable');
const is    = require('is_js');
const jsc   = require('jsverify');

const {
  TypeBasis,
  jscPosInteger,
} = require('./util');

describe('RatioMap', () => {
  test('validate() should throw Error', () => {
    const ratios = new TypeBasis()
      .withoutUndefined()
      .withoutInteger()
      .get()
      .map((v) => { return {a: v}; });

    for (const ratio of ratios) {
      expect(() => RatioMap.validate(ratio)).toThrow(/v_i/);
    }
  });

  test('randomKey() should return some key', () => {
    jsc.assertForall(jsc.dict(jscPosInteger), (input) => {
      if (is.empty(input)) {
        return true;
      }
      const candidates = Map(input).keySeq();

      const ratioMap = new RatioMap(input);
      const result   = ratioMap.randomKey();
      return candidates.includes(result);
    });
  });

  test('randomKey() should return null', () => {
    jsc.assertForall(jsc.dict(jsc.elements([undefined, 0])), (input) => {
      const ratioMap = new RatioMap(input);
      return is.null(ratioMap.randomKey());
    });
  });

  test('randomKey() should return some key whose "ratio" is not 0', () => {
    const inputGenerator = jsc.record({
      selected      : jscPosInteger,
      'non-selected': jsc.elements([undefined, 0]),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const ratioMap = new RatioMap(input);
      const result   = ratioMap.randomKey();
      return result === 'selected';
    });
  });

  test ('this.ranges should be range expression', () => {
    const data = [
      [{a: 1      }, {a: [1, 1]}           ],
      [{a: 1, b: 0}, {a: [1, 1]}           ],
      [{a: 1, b: 1}, {a: [1, 1], b: [2, 2]}],
      [{a: 2, b: 1}, {a: [1, 2], b: [3, 3]}],
      [{a: 1, b: 2}, {a: [1, 1], b: [2, 3]}],
    ];

    for (const [ratio, expected] of data) {
      const ratioMap = new RatioMap(ratio);
      expect(ratioMap.ranges.toJSON()).toEqual(expected);
    }
  });

  test ('this.max should be max of range expression', () => {
    const data = [
      [{a: 1      }, 1],
      [{a: 1, b: 0}, 1],
      [{a: 1, b: 1}, 2],
      [{a: 2, b: 1}, 3],
      [{a: 1, b: 2}, 3],
    ];

    for (const [ratio, expected] of data) {
      const ratioMap = new RatioMap(ratio);
      expect(ratioMap.max).toEqual(expected);
    }
  });
});
