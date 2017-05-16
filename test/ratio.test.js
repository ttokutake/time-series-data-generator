const Ratio = require('../lib/ratio');

const {Map} = require('immutable');
const is    = require('is_js');
const jsc   = require('jsverify');

const {
  jscPosInteger,
} = require('./util');

describe('Ratio', () => {
  test('validate() should throw Error', () => {
    const valueGenerator = jsc.oneof([
      jsc.constant(undefined),
      jsc.bool,
      jsc.string,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const inputGenerator = jsc.dict(valueGenerator);

    jsc.assertForall(inputGenerator, (input) => {
      if (is.empty(input) && is.not.string(input) && is.not.array(input)) {
        return true;
      }
      expect(() => Ratio.validate(input)).toThrow(/v_i/);

      return true;
    });
  });

  test('randomKey() should return some key', () => {
    jsc.assertForall(jsc.dict(jscPosInteger), (input) => {
      if (is.empty(input)) {
        return true;
      }
      const candidates = Map(input).keySeq();
      const output     = new Ratio(input).randomKey();
      return candidates.includes(output);
    });
  });

  test('randomKey() should return null', () => {
    jsc.assertForall(jsc.dict(jsc.elements([null, 0])), (input) => {
      const output = new Ratio(input).randomKey();
      return is.null(output);
    });
  });

  test('randomKey() should return some key whose "ratio" is not 0', () => {
    const inputGenerator = jsc.record({
      selected      : jscPosInteger,
      'non-selected': jsc.elements([null, 0]),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const output = new Ratio(input).randomKey();
      return output === 'selected';
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
      const ratioMap = new Ratio(ratio);
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
      const ratioMap = new Ratio(ratio);
      expect(ratioMap.max).toEqual(expected);
    }
  });
});
