const Series = require('../lib/series');

const jsc = require('jsverify');

describe('Series', () => {
  test('constructor() should throw Error', () => {
    const inputGenerator = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.fn(jsc.json),

      jsc.record({
        type: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.number,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        from: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        until: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        interval: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        numOfPoints: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => new Series(input)).toThrow(/options/);

      return true;
    });
  });
});
