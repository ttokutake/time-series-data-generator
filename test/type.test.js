const {
  isInstanceOf,
  isNotInstanceOf,
} = require('../lib/type');


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
