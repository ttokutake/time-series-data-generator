const {
  isInstanceOf,
  isNotInstanceOf,
  isPair,
  isNotPair,
} = require('../lib/type');

test('isPair() should return true and isNotPair() should do false', () => {
  const input = [1, 2];

  expect(isPair(input)   ).toBeTruthy();
  expect(isNotPair(input)).toBeFalsy();
});

test('isPair() should return false and isNotPair() should do true', () => {
  const inputs = [
    undefined,
    null,
    0,
    '',
    [],
    [1],
    [1, 2, 3],
    {},
  ];

  for (const input of inputs) {
    expect(isPair(input)   ).toBeFalsy();
    expect(isNotPair(input)).toBeTruthy();
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
