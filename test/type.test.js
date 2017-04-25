const {
  isDateRange,
  isNotDateRange,
  isInstanceOf,
  isNotInstanceOf,
} = require('../lib/type');


test('isDateRange() should return true and isNotDateRange() should do false', () => {
  const input = {start: new Date(), end: new Date()};

  expect(isDateRange(input)   ).toBeTruthy();
  expect(isNotDateRange(input)).toBeFalsy();
});

test('isDateRange() should return false and isNotDateRange() should do true', () => {
  const inputs = [
    undefined,
    null,
    0,
    '',
    [],
    {start: new Date()},
    {end  : new Date()},
  ];

  for (const input of inputs) {
    expect(isDateRange(input)   ).toBeFalsy();
    expect(isNotDateRange(input)).toBeTruthy();
  }
});


class Class {
}
class ExtendedClass extends Class {
}

test('isInstanceOf() should return true and isNotInstanceOf() should do false', () => {
  const data = [
    [new Class()        , Class        ],
    [new ExtendedClass(), Class        ],
    [new ExtendedClass(), ExtendedClass],
  ];

  for (const [input, cls] of data) {
    expect(isInstanceOf(input, cls)   ).toBeTruthy();
    expect(isNotInstanceOf(input, cls)).toBeFalsy();
  }
});

test('isInstanceOf() should return false and isNotInstanceOf() should do true', () => {
  const data = [
    [new Class(), ExtendedClass],
  ];

  for (const [input, cls] of data) {
    expect(isInstanceOf(input, cls)   ).toBeFalsy();
    expect(isNotInstanceOf(input, cls)).toBeTruthy();
  }
});
