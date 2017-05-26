const Series = require('../lib/series');

const jsc      = require('jsverify');
const MockDate = require('mockdate');

describe('Series', () => {
  afterEach(() => {
    MockDate.reset();
  });

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

  test('_range() should return unix timestamp series', () => {
    const from        = '2016-01-01T00:00:00Z';
    const until       = '2016-01-01T01:00:00Z';
    const interval    = 10 * 60; // seconds
    const numOfPoints = 5;

    const outputDefault      = new Series({                    from, until, interval})._range().toJSON();
    const outputMonospaced   = new Series({type: 'monospaced', from, until, interval})._range().toJSON();
    const expectedMonospaced = [
      1451606400,
      1451607000,
      1451607600,
      1451608200,
      1451608800,
      1451609400,
      1451610000,
    ];
    expect(outputDefault   ).toEqual(expectedMonospaced);
    expect(outputMonospaced).toEqual(expectedMonospaced);

    jsc.assertForall(jsc.constant(from), jsc.constant(until), jsc.constant(numOfPoints), (from, until, numOfPoints) => {
      const outputRandom = new Series({type: 'random', from, until, numOfPoints})._range();
      expect(outputRandom.size).toBe(numOfPoints);
      expect(outputRandom.every((unix) => 1451606400 <= unix && unix <= 1451610000)).toBeTruthy();
      expect(outputRandom).toEqual(outputRandom.sort());

      return true;
    });
  });

  test('_range() should return unix timestamp series by default options', () => {
    MockDate.set('2017-05-26T00:00:00Z');

    const outputDefault      = new Series(                    )._range().toJSON();
    const outputMonospaced   = new Series({type: 'monospaced'})._range().toJSON();
    const expectedMonospaced = [
      1495753200,
      1495753500,
      1495753800,
      1495754100,
      1495754400,
      1495754700,
      1495755000,
      1495755300,
      1495755600,
      1495755900,
      1495756200,
      1495756500,
      1495756800,
    ];
    expect(outputDefault   ).toEqual(expectedMonospaced);
    expect(outputMonospaced).toEqual(expectedMonospaced);

    jsc.assertForall(jsc.unit, () => {
      const outputRandom = new Series({type: 'random'})._range();
      expect(outputRandom.size).toBe(10);
      expect(outputRandom.every((unix) => 1495753200 <= unix && unix <= 1495756800)).toBeTruthy();
      expect(outputRandom).toEqual(outputRandom.sort());

      return true;
    });
  });

  test('_toElem() should return elem of time series data', () => {
    const unix    = 1495756800;
    const keyName = 'some';
    const value   = 1;
    const output  = Series._toElem(unix, keyName, value);
    expect(output).toEqual({timestamp: '2017-05-26T00:00:00.000Z', some: 1});
  });

  test('sin() should return sine curve', () => {
  });

  test('cos() should return cosine curve', () => {
  });

  test('ratio() should return time series data', () => {
  });
});
