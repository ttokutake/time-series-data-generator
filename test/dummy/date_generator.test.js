const DateGenerator = require('../../lib/dummy/date_generator');

const is       = require('is_js');
const jsc      = require('jsverify');
const mockDate = require('mockdate');
const moment   = require('moment');

const {
  TypeBasis,
} = require('../util');

describe('DateGenerator', () => {
  afterEach(() => {
    mockDate.reset();
  });

  test('constructor() should throw Error', () => {
    const now    = moment();
    const inputs = [
      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .get()),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutInteger()
        .get()
        .map((v) => { return {from: v}; })),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutInteger()
        .get()
        .map((v) => { return {until: v}; })),

      {from: now.toDate(), until: now.subtract(1, 'milliseconds').toDate()}
    ];

    for (const input of inputs) {
      expect(() => new DateGenerator(input)).toThrow();
    }
  });

  test('randomDate() should return recent Date', () => {
    jsc.assertForall(jsc.elements([undefined, null]), (input) => {
      const output = moment(new DateGenerator(input).randomDate());
      const now    = new Date();
      const from   = moment(now).subtract(1, 'days');
      const until  = now;
      return output.isBetween(from, now, null, '[)');
    });
  });

  test('randomDate() should return Date satisfying "from" <= "until"', () => {
    jsc.assertForall(jsc.datetime, jsc.datetime, (x, y) => {
      const [from, until] = x.getTime() > y.getTime() ? [y, x] : [x, y];

      const inputs = [
        {from                    , until                     },
        {from: from.getTime()    , until: until.getTime()    },
        {from: from.toISOString(), until: until.toISOString()},
      ];
      for (const input of inputs) {
        const outputDate = moment(new DateGenerator(input).randomDate());
        expect(outputDate.isBetween(from, until, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });

  test('randomDate() should return Date satisfying "from" <= now', () => {
    mockDate.set('2100-01-01T00:00:00.000Z');
    jsc.assertForall(jsc.datetime, (from) => {
      const now = new Date();

      const inputs = [
        {from                  },
        {from, until: undefined},
        {from, until: null     },
      ];
      for (const input of inputs) {
        const output = moment(new DateGenerator(input).randomDate());
        expect(output.isBetween(from, now, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });

  test('randomDate() should return Date satisfying now <= "until"', () => {
    mockDate.set('2000-01-01T00:00:00.000Z');
    jsc.assertForall(jsc.datetime, (until) => {
      const now = new Date();

      const inputs = [
        {                 until},
        {from: undefined, until},
        {from: null     , until},
      ];
      for (const input of inputs) {
        const output = moment(new DateGenerator(input).randomDate());
        expect(output.isBetween(now, until, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });
});
