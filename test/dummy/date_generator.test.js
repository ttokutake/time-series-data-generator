const DateGenerator = require('../../lib/dummy/date_generator');

const is       = require('is_js');
const jsc      = require('jsverify');
const MockDate = require('mockdate');
const moment   = require('moment');

describe('DateGenerator', () => {
  afterEach(() => {
    MockDate.reset();
  });

  test('constructor() should throw Error', () => {
    const valueGenerator = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorFrom = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorUntil = valueGeneratorFrom;
    const inputGenerator = jsc.oneof([
      valueGenerator,
      jsc.record({from : valueGeneratorFrom }),
      jsc.record({until: valueGeneratorUntil}),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => new DateGenerator(input)).toThrow();

      return true;
    });

    const now   = moment();
    const input = {from: now.toDate(), until: now.subtract(1, 'milliseconds').toDate()};
    expect(() => new DateGenerator(input)).toThrow(/satisfying/);
  });

  test('randomDate() should return recent Date', () => {
    jsc.assertForall(jsc.constant(undefined), (input) => {
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
        const output = moment(new DateGenerator(input).randomDate());
        expect(output.isBetween(from, until, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });

  test('randomDate() should return Date satisfying "from" <= now', () => {
    MockDate.set('2100-01-01T00:00:00.000Z');
    jsc.assertForall(jsc.datetime, (from) => {
      const now = new Date();

      const inputs = [
        {from                  },
        {from, until: undefined},
      ];
      for (const input of inputs) {
        const output = moment(new DateGenerator(input).randomDate());
        expect(output.isBetween(from, now, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });

  test('randomDate() should return Date satisfying now <= "until"', () => {
    MockDate.set('2000-01-01T00:00:00.000Z');
    jsc.assertForall(jsc.datetime, (until) => {
      const now = new Date();

      const inputs = [
        {                 until},
        {from: undefined, until},
      ];
      for (const input of inputs) {
        const output = moment(new DateGenerator(input).randomDate());
        expect(output.isBetween(now, until, null, '[]')).toBeTruthy();
      }

      return true;
    });
  });
});
