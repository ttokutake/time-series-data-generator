const RatioMap = require('../lib/ratio_map');

const {Map} = require('immutable');
const is    = require('is_js');
const jsc   = require('jsverify');

const {
  jscPosInteger,
} = require('./util');

test('RatioMap.randomKey() return some key', () => {
  jsc.assertForall(jsc.dict(jscPosInteger), (input) => {
    if (is.empty(input)) {
      return true;
    }
    const candidates = Map(input).keySeq();

    const ratioMap = new RatioMap(input);
    const result   = ratioMap.randomKey();
    return candidates.some((c) => c === result);
  });
});

test('RatioMap.randomKey() return null', () => {
  jsc.assertForall(jsc.dict(jsc.integer(0)), (input) => {
    const ratioMap = new RatioMap(input);
    return is.null(ratioMap.randomKey());
  });
});

test('RatioMap.validate() throw error', () => {
  const ratios = [
    {a: undefined},
    {a: null     },
    {a: '0'      },
    {a: []       },
    {a: {}       },
  ];

  for (ratio of ratios) {
    expect(() => RatioMap.validate(ratio)).toThrow(/v_i/);
  }
});

test ('RatioMap.ranges should be range expression', () => {
  const data = [
    [{a: 1      }, {a: [1, 1]}           ],
    [{a: 1, b: 0}, {a: [1, 1]}           ],
    [{a: 1, b: 1}, {a: [1, 1], b: [2, 2]}],
    [{a: 2, b: 1}, {a: [1, 2], b: [3, 3]}],
    [{a: 1, b: 2}, {a: [1, 1], b: [2, 3]}],
  ];

  for ([ratio, expected] of data) {
    const ratioMap = new RatioMap(ratio);
    expect(ratioMap.ranges.toJSON()).toEqual(expected);
  }
});

test ('RatioMap.max should be max of range expression', () => {
  const data = [
    [{a: 1      }, 1],
    [{a: 1, b: 0}, 1],
    [{a: 1, b: 1}, 2],
    [{a: 2, b: 1}, 3],
    [{a: 1, b: 2}, 3],
  ];

  for ([ratio, expected] of data) {
    const ratioMap = new RatioMap(ratio);
    expect(ratioMap.max).toEqual(expected);
  }
});
