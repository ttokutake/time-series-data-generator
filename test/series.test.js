const Series = require('../lib/series');

const {List}   = require('immutable');
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
        numOfData: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        keyName: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.number,
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

  describe('_range()', () => {
    test('it should return unix timestamp series', () => {
      const from      = '2016-01-01T00:00:00Z';
      const until     = '2016-01-01T01:00:00Z';
      const interval  = 10 * 60; // seconds
      const numOfData = 5;

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

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfData})._range();
        expect(outputRandom.size).toBe(numOfData);
        expect(outputRandom.every((unix) => 1451606400 <= unix && unix <= 1451610000)).toBeTruthy();
        expect(outputRandom).toEqual(outputRandom.sort());

        return true;
      });
    });

    test('it should return unix timestamp series by default options', () => {
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
  });

  test('_toElem() should return elem of time series data', () => {
    const series = new Series({keyName: 'some'});
    const unix   = 1495756800;
    const value  = 1;
    const output = series._toElem(unix, value);
    expect(output).toEqual({timestamp: '2017-05-26T00:00:00.000Z', some: 1});
  });

  test('_trigonometric() should throw Error', () => {
    const series = new Series();

    const inputGenerator = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.fn(jsc.json),

      jsc.record({
        coefficient: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        constant: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        decimalDigits: jsc.oneof([
          jsc.constant(null),
          jsc.bool,
          jsc.string,
          jsc.array(jsc.json),
          jsc.dict(jsc.json),
          jsc.fn(jsc.json),
        ]),
      }),
      jsc.record({
        period: jsc.oneof([
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
      expect(() => series.sin(input)).toThrow(/options/);
      expect(() => series.cos(input)).toThrow(/options/);

      return true;
    });
  });

  describe('sin()', () => {
    const from      = '2016-01-01T00:00:00Z';
    const until     = '2016-01-01T01:00:00Z';
    const interval  = 10 * 60; // seconds
    const numOfData = 5;

    test('it should return sine curve', () => {
      const coefficient   = 2;
      const constant      = 1;
      const decimalDigits = 1;
      const period        = 2 * 60 * 60; // seconds

      const outputMonospaced = new Series({from, until, interval})
        .sin({coefficient, constant, decimalDigits, period});
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', value: 1  },
        {timestamp: '2016-01-01T00:10:00.000Z', value: 2  },
        {timestamp: '2016-01-01T00:20:00.000Z', value: 2.7},
        {timestamp: '2016-01-01T00:30:00.000Z', value: 3  },
        {timestamp: '2016-01-01T00:40:00.000Z', value: 2.7},
        {timestamp: '2016-01-01T00:50:00.000Z', value: 2  },
        {timestamp: '2016-01-01T01:00:00.000Z', value: 1  },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfData})
          .sin({coefficient, constant, decimalDigits, period});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= value && value <= 3
          );
        })).toBeTruthy();

        return true;
      });
    });

    test('it should return sine curve by default options', () => {
      const outputMonospaced   = new Series({from, until, interval}).sin();
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', value: 0    },
        {timestamp: '2016-01-01T00:10:00.000Z', value: 0.87 },
        {timestamp: '2016-01-01T00:20:00.000Z', value: 0.87 },
        {timestamp: '2016-01-01T00:30:00.000Z', value: -0   },
        {timestamp: '2016-01-01T00:40:00.000Z', value: -0.87},
        {timestamp: '2016-01-01T00:50:00.000Z', value: -0.87},
        {timestamp: '2016-01-01T01:00:00.000Z', value: -0   },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfData}).sin();
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= value && value <= 1
          );
        })).toBeTruthy();

        return true;
      });
    });
  });

  describe('cos()', () => {
    const from      = '2016-01-01T00:00:00Z';
    const until     = '2016-01-01T01:00:00Z';
    const interval  = 10 * 60; // seconds
    const numOfData = 5;

    test('it should return cosine curve', () => {
      const coefficient   = 2;
      const constant      = 1;
      const decimalDigits = 1;
      const period        = 2 * 60 * 60; // seconds

      const outputMonospaced = new Series({from, until, interval})
        .cos({coefficient, constant, decimalDigits, period});
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', value: 3   },
        {timestamp: '2016-01-01T00:10:00.000Z', value: 2.7 },
        {timestamp: '2016-01-01T00:20:00.000Z', value: 2   },
        {timestamp: '2016-01-01T00:30:00.000Z', value: 1   },
        {timestamp: '2016-01-01T00:40:00.000Z', value: 0   },
        {timestamp: '2016-01-01T00:50:00.000Z', value: -0.7},
        {timestamp: '2016-01-01T01:00:00.000Z', value: -1  },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfData})
          .cos({coefficient, constant, decimalDigits, period});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= value && value <= 3
          );
        })).toBeTruthy();

        return true;
      });
    });

    test('it should return cosine curve by default options', () => {
      const outputMonospaced   = new Series({from, until, interval}).cos();
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', value: 1   },
        {timestamp: '2016-01-01T00:10:00.000Z', value: 0.5 },
        {timestamp: '2016-01-01T00:20:00.000Z', value: -0.5},
        {timestamp: '2016-01-01T00:30:00.000Z', value: -1  },
        {timestamp: '2016-01-01T00:40:00.000Z', value: -0.5},
        {timestamp: '2016-01-01T00:50:00.000Z', value: 0.5 },
        {timestamp: '2016-01-01T01:00:00.000Z', value: 1   },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfData}).cos();
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= value && value <= 1
          );
        })).toBeTruthy();

        return true;
      });
    });
  });

  test('ratio() should return time series data', () => {
    const from      = '2016-01-01T00:00:00Z';
    const until     = '2016-01-01T01:00:00Z';
    const interval  = 10 * 60; // seconds
    const numOfData = 5;

    const params = {
      rock    : 2,
      scissors: 2,
      paper   : 1,
    };

    jsc.assertForall(jsc.unit, () => {
      const outputMonospaced = new Series({from, until, interval}).ratio(params);
      expect(outputMonospaced.length).toBe(7);
      expect(outputMonospaced.every(({timestamp, value}) => {
        return (
          '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
        ) && (
          List(['rock', 'scissors', 'paper']).includes(value)
        );
      })).toBeTruthy();

      const outputRandom = new Series({type: 'random', from, until, numOfData}).ratio(params);
      expect(outputRandom.length).toBe(5);
      expect(outputRandom.every(({timestamp, value}) => {
        return (
          '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
        ) && (
          List(['rock', 'scissors', 'paper']).includes(value)
        );
      })).toBeTruthy();

      return true;
    });
  });
});
