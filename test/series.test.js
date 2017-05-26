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

  describe('_range()', () => {
    test('it should return unix timestamp series', () => {
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

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfPoints})._range();
        expect(outputRandom.size).toBe(numOfPoints);
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
    const unix    = 1495756800;
    const keyName = 'some';
    const value   = 1;
    const output  = Series._toElem(unix, keyName, value);
    expect(output).toEqual({timestamp: '2017-05-26T00:00:00.000Z', some: 1});
  });

  describe('sin()', () => {
    const from        = '2016-01-01T00:00:00Z';
    const until       = '2016-01-01T01:00:00Z';
    const interval    = 10 * 60; // seconds
    const numOfPoints = 5;

    test('it should return sine curve', () => {
      const keyName       = 'sin';
      const coefficient   = 2;
      const constant      = 1;
      const decimalDigits = 1;
      const period        = 2 * 60 * 60; // seconds

      const outputMonospaced = new Series({from, until, interval})
        .sin({keyName, coefficient, constant, decimalDigits, period});
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', sin: 1  },
        {timestamp: '2016-01-01T00:10:00.000Z', sin: 2  },
        {timestamp: '2016-01-01T00:20:00.000Z', sin: 2.7},
        {timestamp: '2016-01-01T00:30:00.000Z', sin: 3  },
        {timestamp: '2016-01-01T00:40:00.000Z', sin: 2.7},
        {timestamp: '2016-01-01T00:50:00.000Z', sin: 2  },
        {timestamp: '2016-01-01T01:00:00.000Z', sin: 1  },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfPoints})
          .sin({keyName, coefficient, constant, decimalDigits, period});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, sin}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= sin && sin <= 3
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
        const outputRandom = new Series({type: 'random', from, until, numOfPoints}).sin();
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
    const from        = '2016-01-01T00:00:00Z';
    const until       = '2016-01-01T01:00:00Z';
    const interval    = 10 * 60; // seconds
    const numOfPoints = 5;

    test('it should return cosine curve', () => {
      const keyName       = 'cos';
      const coefficient   = 2;
      const constant      = 1;
      const decimalDigits = 1;
      const period        = 2 * 60 * 60; // seconds

      const outputMonospaced = new Series({from, until, interval})
        .cos({keyName, coefficient, constant, decimalDigits, period});
      const expectedMonospaced = [
        {timestamp: '2016-01-01T00:00:00.000Z', cos: 3   },
        {timestamp: '2016-01-01T00:10:00.000Z', cos: 2.7 },
        {timestamp: '2016-01-01T00:20:00.000Z', cos: 2   },
        {timestamp: '2016-01-01T00:30:00.000Z', cos: 1   },
        {timestamp: '2016-01-01T00:40:00.000Z', cos: 0   },
        {timestamp: '2016-01-01T00:50:00.000Z', cos: -0.7},
        {timestamp: '2016-01-01T01:00:00.000Z', cos: -1  },
      ];
      expect(outputMonospaced).toEqual(expectedMonospaced);

      jsc.assertForall(jsc.unit, () => {
        const outputRandom = new Series({type: 'random', from, until, numOfPoints})
          .cos({keyName, coefficient, constant, decimalDigits, period});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, cos}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            -1 <= cos && cos <= 3
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
        const outputRandom = new Series({type: 'random', from, until, numOfPoints}).cos();
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

  describe('ratio()', () => {
    const from        = '2016-01-01T00:00:00Z';
    const until       = '2016-01-01T01:00:00Z';
    const interval    = 10 * 60; // seconds
    const numOfPoints = 5;

    const params = {
      rock    : 2,
      scissors: 2,
      paper   : 1,
    };

    test('it should return time series data', () => {
      const keyName = 'state';

      jsc.assertForall(jsc.unit, () => {
        const outputMonospaced = new Series({from, until, interval}).ratio(params, {keyName});
        expect(outputMonospaced.length).toBe(7);
        expect(outputMonospaced.every(({timestamp, state}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            List(['rock', 'scissors', 'paper']).includes(state)
          );
        })).toBeTruthy();

        const outputRandom = new Series({type: 'random', from, until, numOfPoints}).ratio(params, {keyName});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, state}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            List(['rock', 'scissors', 'paper']).includes(state)
          );
        })).toBeTruthy();

        return true;
      });
    });

    test('it should return time series data by default options', () => {
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

        const outputRandom = new Series({type: 'random', from, until, numOfPoints}).ratio(params);
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
});
