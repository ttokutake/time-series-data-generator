const {
  randomInt,
} = require('../lib/random');

const is  = require('is_js');
const jsc = require('jsverify');

test('randomInt() should return integer between range of min and max', () => {
  const returnRandomValueGteMinAndLteMax = jsc.forall(jsc.integer(), jsc.nat(), (min, diff) => {
    const max    = min + diff;
    const result = randomInt(min, max);
    return min <= result && result <= max;
  });
  jsc.assert(returnRandomValueGteMinAndLteMax);
});

test('randomInt() should return null', () => {
  const returnNull = jsc.forall(jsc.integer(), jsc.integer(1, 100), (min, diff) => {
    const max    = min - diff;
    const result = randomInt(min, max);
    return is.null(result);
  });
  jsc.assert(returnNull);
});

test('randomInt() should throw Error', () => {
  const inputs = [
    undefined,
    null,
    '0',
    [],
    {},
  ];

  for (input of inputs) {
    expect(() => randomInt(input, 0    )).toThrow(/min/);
    expect(() => randomInt(0    , input)).toThrow(/max/);
  }
});
