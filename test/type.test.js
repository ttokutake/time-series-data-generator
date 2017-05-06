const {
  isInstanceOf,
  isNotInstanceOf,
} = require('../lib/type');


describe('isInstanceOf() & isNotInstanceOf()', () => {
  class Class {
  }
  class ExtendedClass extends Class {
  }

  test('it should return true & opposite should do false', () => {
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

  test('it should return false & opposite should do true', () => {
    const data = [
      [new Class(), ExtendedClass],
    ];

    for (const [input, cls] of data) {
      expect(isInstanceOf(input, cls)   ).toBeFalsy();
      expect(isNotInstanceOf(input, cls)).toBeTruthy();
    }
  });
});
