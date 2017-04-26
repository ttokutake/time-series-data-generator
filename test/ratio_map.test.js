const RatioMap = require('../lib/ratio_map');

const {Map} = require('immutable');
const is    = require('is_js');
const jsc   = require('jsverify');

test('RatioMap.randomKey() return some key', () => {
  const posInteger = jsc.integer(1, 10000);
  jsc.assertForall(jsc.nearray(jsc.pair(jsc.asciistring, posInteger)), (data) => {
    const input      = data.reduce((map, [key, ratio]) => map.set(key, ratio), Map()).toJSON();
    const candidates = data.filter(([_, ratio]) => ratio > 0).map(([key, _]) => key);

    const result = new RatioMap(input).randomKey();
    return candidates.some((c) => c === result);
  });
});

test('RatioMap.randomKey() return null', () => {
  jsc.assertForall(jsc.nearray(jsc.pair(jsc.asciistring, jsc.integer(0))), (data) => {
    const input = data.reduce((map, [key, ratio]) => map.set(key, ratio), Map()).toJSON();

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
