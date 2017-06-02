const Series = require('../lib/series');

const jsc      = require('jsverify');
const MockDate = require('mockdate');

describe('Series', () => {
  afterEach(() => {
    MockDate.reset();
  });

  test('constructor() should throw Error', () => {
    const inputs = [
      null,
      false,
      0,
      '',
      [],
      {key: undefined},
      () => {},

      {type: null},
      {type: false},
      {type: 0},
      {type: 'non-enum'},
      {type: []},
      {type: {}},
      {type: () => {}},

      {from: null},
      {from: false},
      {from: 0.1},
      {from: 'non-date'},
      {from: []},
      {from: {}},
      {from: () => {}},

      {until: null},
      {until: false},
      {until: 0.1},
      {until: 'non-date'},
      {until: []},
      {until: {}},
      {until: () => {}},

      {interval: null},
      {interval: false},
      {interval: 0},
      {interval: 0.1},
      {interval: ''},
      {interval: []},
      {interval: {}},
      {interval: () => {}},

      {interval: null},
      {interval: false},
      {interval: -1},
      {interval: 0.1},
      {interval: ''},
      {interval: []},
      {interval: {}},
      {interval: () => {}},

      {interval: null},
      {interval: false},
      {interval: 0},
      {interval: []},
      {interval: {}},
      {interval: () => {}},
    ];

    for (const input of inputs) {
      expect(() => new Series(input)).toThrow(/options/);
    }
  });

  test('clone() should return overwrited instance', () => {
    const original = new Series();

    const changedType = original.clone({type: 'random'});
    expect(changedType.type ).toBe('random' );
    expect(changedType.from .unix() ).toBe(original.from .unix() );
    expect(changedType.until.unix() ).toBe(original.until.unix() );
    expect(changedType.interval.asSeconds()).toBe(original.interval.asSeconds());
    expect(changedType.numOfData ).toBe(original.numOfData );
    expect(changedType.keyName ).toBe(original.keyName );

    const changedFrom = original.clone({from: '2016-01-01T00:00:00Z'});
    expect(changedFrom.type ).toBe(original.type );
    expect(changedFrom.from .unix() ).toBe(1451606400 );
    expect(changedFrom.until.unix() ).toBe(original.until.unix() );
    expect(changedFrom.interval.asSeconds()).toBe(original.interval.asSeconds());
    expect(changedFrom.numOfData ).toBe(original.numOfData );
    expect(changedFrom.keyName ).toBe(original.keyName );

    const changedUntil = original.clone({until: '2016-01-01T01:00:00Z'});
    expect(changedUntil.type ).toBe(original.type );
    expect(changedUntil.from .unix() ).toBe(original.from .unix() );
    expect(changedUntil.until.unix() ).toBe(1451610000 );
    expect(changedUntil.interval.asSeconds()).toBe(original.interval.asSeconds());
    expect(changedUntil.numOfData ).toBe(original.numOfData );
    expect(changedUntil.keyName ).toBe(original.keyName );

    const changedInterval = original.clone({interval: 1});
    expect(changedInterval.type ).toBe(original.type );
    expect(changedInterval.from .unix() ).toBe(original.from .unix());
    expect(changedInterval.until.unix() ).toBe(original.until.unix());
    expect(changedInterval.interval.asSeconds()).toBe(1 );
    expect(changedInterval.numOfData ).toBe(original.numOfData );
    expect(changedInterval.keyName ).toBe(original.keyName );

    const changedNumOfData = original.clone({numOfData: 100});
    expect(changedNumOfData.type ).toBe(original.type );
    expect(changedNumOfData.from .unix() ).toBe(original.from .unix() );
    expect(changedNumOfData.until.unix() ).toBe(original.until.unix() );
    expect(changedNumOfData.interval.asSeconds()).toBe(original.interval.asSeconds());
    expect(changedNumOfData.numOfData ).toBe(100 );
    expect(changedNumOfData.keyName ).toBe(original.keyName );

    const changedKeyName = original.clone({keyName: 'something'});
    expect(changedKeyName.type ).toBe(original.type );
    expect(changedKeyName.from .unix() ).toBe(original.from .unix() );
    expect(changedKeyName.until.unix() ).toBe(original.until.unix() );
    expect(changedKeyName.interval.asSeconds()).toBe(original.interval.asSeconds());
    expect(changedKeyName.numOfData ).toBe(original.numOfData );
    expect(changedKeyName.keyName ).toBe('something' );
  });

  describe('_timestamps()', () => {
    test('it should return unix timestamp series', () => {
      const from      = '2016-01-01T00:00:00Z';
      const until     = '2016-01-01T01:00:00Z';
      const interval  = 10 * 60; // seconds
      const numOfData = 5;

      const series           = new Series({from, until, interval});
      const seriesMonospaced = new Series({type: 'monospaced', from, until, interval});
      const outputDefault      = series ._timestamps().toJSON();
      const outputMonospaced   = seriesMonospaced._timestamps().toJSON();
      const expectedMonospaced = [
        1451606400,
        1451607000,
        1451607600,
        1451608200,
        1451608800,
        1451609400,
        1451610000,
      ];
      expect(outputDefault ).toEqual(expectedMonospaced);
      expect(outputMonospaced).toEqual(expectedMonospaced);

      const seriesRandom = new Series({type: 'random', from, until, numOfData});
      jsc.assertForall(jsc.unit, () => {
        const outputRandom = seriesRandom._timestamps();
        expect(outputRandom.size).toBe(numOfData);
        expect(outputRandom.every((unix) => 1451606400 <= unix && unix <= 1451610000)).toBeTruthy();
        expect(outputRandom).toEqual(outputRandom.sort());

        return true;
      });
    });

    test('it should return unix timestamp series by default options', () => {
      MockDate.set('2017-05-26T00:00:00Z');

      const series           = new Series({});
      const seriesMonospaced = new Series({type: 'monospaced'});
      const outputDefault      = series ._timestamps().toJSON();
      const outputMonospaced   = seriesMonospaced._timestamps().toJSON();
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
      expect(outputDefault ).toEqual(expectedMonospaced);
      expect(outputMonospaced).toEqual(expectedMonospaced);

      const seriesRandom = new Series({type: 'random'});
      jsc.assertForall(jsc.unit, () => {
        const outputRandom = seriesRandom._timestamps();
        expect(outputRandom.size).toBe(10);
        expect(outputRandom.every((unix) => 1495753200 <= unix && unix <= 1495756800)).toBeTruthy();
        expect(outputRandom).toEqual(outputRandom.sort());

        return true;
      });
    });
  });

  test('generate() should throw Error', () => {
    const series = new Series();
    const inputs = [
      undefined,
      null,
      false,
      0,
      '',
      [],
      {},
    ];

    for (const input of inputs) {
      expect(() => series.generate(input)).toThrow(/func/);
    }
  });

  describe('_trigonometric()', () => {
    test('they should throw Error', () => {
      const series = new Series();
      const inputs = [
        null,
        false,
        0,
        '',
        [],
        {key: undefined},
        () => {},

        {coefficient: null},
        {coefficient: false},
        {coefficient: ''},
        {coefficient: []},
        {coefficient: {}},
        {coefficient: () => {}},

        {constant: null},
        {constant: false},
        {constant: ''},
        {constant: []},
        {constant: {}},
        {constant: () => {}},

        {decimalDigits: null},
        {decimalDigits: false},
        {decimalDigits: -1},
        {decimalDigits: 11},
        {decimalDigits: 0.1},
        {decimalDigits: ''},
        {decimalDigits: []},
        {decimalDigits: {}},
        {decimalDigits: () => {}},

        {period: null},
        {period: false},
        {period: 0},
        {period: 0.1},
        {period: ''},
        {period: []},
        {period: {}},
        {period: () => {}},
      ];

      for (const input of inputs) {
        expect(() => series.sin(input)).toThrow(/options/);
        expect(() => series.cos(input)).toThrow(/options/);
      }
    });

    describe('sin()', () => {
      const from      = '2016-01-01T00:00:00Z';
      const until     = '2016-01-01T01:00:00Z';
      const interval  = 10 * 60; // seconds
      const numOfData = 5;

      const series       = new Series({from, until, interval});
      const seriesRandom = new Series({type: 'random', from, until, numOfData});

      test('it should return sine curve', () => {
        const coefficient   = 2;
        const constant      = 1;
        const decimalDigits = 1;
        const period        = 2 * 60 * 60; // seconds

        const outputMonospaced = series.sin({coefficient, constant, decimalDigits, period});
        const expectedMonospaced = [
          {timestamp: '2016-01-01T00:00:00.000Z', value: 1},
          {timestamp: '2016-01-01T00:10:00.000Z', value: 2},
          {timestamp: '2016-01-01T00:20:00.000Z', value: 2.7},
          {timestamp: '2016-01-01T00:30:00.000Z', value: 3},
          {timestamp: '2016-01-01T00:40:00.000Z', value: 2.7},
          {timestamp: '2016-01-01T00:50:00.000Z', value: 2},
          {timestamp: '2016-01-01T01:00:00.000Z', value: 1},
        ];
        expect(outputMonospaced).toEqual(expectedMonospaced);

        jsc.assertForall(jsc.unit, () => {
          const outputRandom = seriesRandom.sin({coefficient, constant, decimalDigits, period});
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
        const outputMonospaced   = series.sin();
        const expectedMonospaced = [
          {timestamp: '2016-01-01T00:00:00.000Z', value: 0},
          {timestamp: '2016-01-01T00:10:00.000Z', value: 0.87},
          {timestamp: '2016-01-01T00:20:00.000Z', value: 0.87},
          {timestamp: '2016-01-01T00:30:00.000Z', value: -0},
          {timestamp: '2016-01-01T00:40:00.000Z', value: -0.87},
          {timestamp: '2016-01-01T00:50:00.000Z', value: -0.87},
          {timestamp: '2016-01-01T01:00:00.000Z', value: -0},
        ];
        expect(outputMonospaced).toEqual(expectedMonospaced);

        jsc.assertForall(jsc.unit, () => {
          const outputRandom = seriesRandom.sin();
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

      const series       = new Series({from, until, interval});
      const seriesRandom = new Series({type: 'random', from, until, numOfData});

      test('it should return cosine curve', () => {
        const coefficient   = 2;
        const constant      = 1;
        const decimalDigits = 1;
        const period        = 2 * 60 * 60; // seconds

        const outputMonospaced = series.cos({coefficient, constant, decimalDigits, period});
        const expectedMonospaced = [
          {timestamp: '2016-01-01T00:00:00.000Z', value: 3},
          {timestamp: '2016-01-01T00:10:00.000Z', value: 2.7},
          {timestamp: '2016-01-01T00:20:00.000Z', value: 2},
          {timestamp: '2016-01-01T00:30:00.000Z', value: 1},
          {timestamp: '2016-01-01T00:40:00.000Z', value: 0},
          {timestamp: '2016-01-01T00:50:00.000Z', value: -0.7},
          {timestamp: '2016-01-01T01:00:00.000Z', value: -1},
        ];
        expect(outputMonospaced).toEqual(expectedMonospaced);

        jsc.assertForall(jsc.unit, () => {
          const outputRandom = seriesRandom.cos({coefficient, constant, decimalDigits, period});
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
        const outputMonospaced   = series.cos();
        const expectedMonospaced = [
          {timestamp: '2016-01-01T00:00:00.000Z', value: 1},
          {timestamp: '2016-01-01T00:10:00.000Z', value: 0.5},
          {timestamp: '2016-01-01T00:20:00.000Z', value: -0.5},
          {timestamp: '2016-01-01T00:30:00.000Z', value: -1},
          {timestamp: '2016-01-01T00:40:00.000Z', value: -0.5},
          {timestamp: '2016-01-01T00:50:00.000Z', value: 0.5},
          {timestamp: '2016-01-01T01:00:00.000Z', value: 1},
        ];
        expect(outputMonospaced).toEqual(expectedMonospaced);

        jsc.assertForall(jsc.unit, () => {
          const outputRandom = seriesRandom.cos();
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
  });

  describe('gaussian()', () => {
    test('it should throw Error', () => {
      const series = new Series();
      const inputs = [
        null,
        false,
        0,
        '',
        [],
        {key: undefined},
        () => {},

        {mean: null},
        {mean: false},
        {mean: ''},
        {mean: []},
        {mean: {}},
        {mean: () => {}},

        {variance: null},
        {variance: false},
        {variance: ''},
        {variance: []},
        {variance: {}},
        {variance: () => {}},

        {decimalDigits: null},
        {decimalDigits: false},
        {decimalDigits: -1},
        {decimalDigits: 11},
        {decimalDigits: 0.1},
        {decimalDigits: ''},
        {decimalDigits: []},
        {decimalDigits: {}},
        {decimalDigits: () => {}},
      ];

      for (const input of inputs) {
        expect(() => series.gaussian(input)).toThrow(/options/);
      }
    });

    const from      = '2016-01-01T00:00:00Z';
    const until     = '2016-01-01T01:00:00Z';
    const interval  = 10 * 60; // seconds
    const numOfData = 5;

    const series       = new Series({from, until, interval});
    const seriesRandom = new Series({type: 'random', from, until, numOfData});

    test('it should return time series data with 1', () => {
      const mean     = 1;
      const variance = 0;

      jsc.assertForall(jsc.unit, () => {
        const outputMonospaced = series.gaussian({mean, variance});
        expect(outputMonospaced.length).toBe(7);
        expect(outputMonospaced.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            value === 1
          );
        })).toBeTruthy();

        const outputRandom = seriesRandom.gaussian({mean, variance});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp, value}) => {
          return (
            '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
          ) && (
            value === 1
          );
        })).toBeTruthy();

        return true;
      });
    });

    test('it should return time series numbers with gaussian distribution', () => {
      const mean          = 1;
      const variance      = 0.1;
      const decimalDigits = 1;

      jsc.assertForall(jsc.unit, () => {
        const outputMonospaced = series.gaussian({mean, variance, decimalDigits});
        expect(outputMonospaced.length).toBe(7);
        expect(outputMonospaced.every(({timestamp}) => {
          return '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z';
        })).toBeTruthy();

        const outputRandom = seriesRandom.gaussian({mean, variance, decimalDigits});
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp}) => {
          return '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z';
        })).toBeTruthy();

        return true;
      });
    });

    test('it should return time series numbers with gaussian distribution by default options', () => {
      jsc.assertForall(jsc.unit, () => {
        const outputMonospaced = series.gaussian();
        expect(outputMonospaced.length).toBe(7);
        expect(outputMonospaced.every(({timestamp}) => {
          return '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z';
        })).toBeTruthy();

        const outputRandom = seriesRandom.gaussian();
        expect(outputRandom.length).toBe(5);
        expect(outputRandom.every(({timestamp}) => {
          return '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z';
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

    const series       = new Series({from, until, interval});
    const seriesRandom = new Series({type: 'random', from, until, numOfData});

    const params = {
      rock    : 2,
      scissors: 2,
      paper   : 1,
    };

    jsc.assertForall(jsc.unit, () => {
      const outputMonospaced = series.ratio(params);
      expect(outputMonospaced.length).toBe(7);
      expect(outputMonospaced.every(({timestamp, value}) => {
        return (
          '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
        ) && (
          ['rock', 'scissors', 'paper'].includes(value)
        );
      })).toBeTruthy();

      const outputRandom = seriesRandom.ratio(params);
      expect(outputRandom.length).toBe(5);
      expect(outputRandom.every(({timestamp, value}) => {
        return (
          '2016-01-01T00:00:00.000Z' <= timestamp && timestamp <= '2016-01-01T01:00:00.000Z'
        ) && (
          ['rock', 'scissors', 'paper'].includes(value)
        );
      })).toBeTruthy();

      return true;
    });
  });
});
