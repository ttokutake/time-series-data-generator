const {
  isPair,
  isNotPair,
} = require('./type.js');

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
