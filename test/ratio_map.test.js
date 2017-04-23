const {RatioMap} = require('../lib/ratio_map');

test('RatioMap.randomKey() return some key', () => {
  const numOfTrails = 10;
  const data        = [
    [{a: 1}      , /^a$/    ],
    [{a: 1, b: 0}, /^a$/    ],
    [{a: 1, b: 1}, /^(a|b)$/],
    [{a: 2, b: 1}, /^(a|b)$/],
    [{a: 1, b: 2}, /^(a|b)$/],
  ];

  for ([ratio, expected] of data) {
    const ratioMap = new RatioMap(ratio);
    expect(ratioMap.randomKey()).toMatch(expected);
  }
});

test('RatioMap.randomKey() return null', () => {
  const ratioMap = new RatioMap({a: 0});
  expect(ratioMap.randomKey()).toBeNull();
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

test ('RatioMap.max should be max of range expression', () => {
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
