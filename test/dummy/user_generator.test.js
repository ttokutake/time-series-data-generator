const UserGenerator = require('../../lib/dummy/user_generator');

const {Map} = require('immutable');
const is    = require('is_js');
const jsc   = require('jsverify');

const {
  jscPosInteger,
} = require('../util');

describe('UserGenerator', () => {
  test('constructor() should throw Error', () => {
  });

  test('randomUser() should return some user', () => {
    const inputGenerator = jsc.record({
      num      : jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jsc.nat(),
        normal   : jsc.nat(),
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      return user.has('email') && user.has('uuid') && user.has('userAgent') && user.has('ipAddress');
    });
  });

  test('randomUser() should return some anonymous user', () => {
    const inputGenerator = jsc.record({
      num      : jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jscPosInteger,
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      return user.get('email') === '-' && is.null(user.get('uuid')) && user.has('userAgent') && user.has('ipAddress');
    });
  });

  test('randomUser() should return null', () => {
    const input = {num: 0};
    expect(new UserGenerator(input).randomUser()).toBeNull();
  });

  test('all() should return all users', () => {
    const inputGenerator = jsc.record({
      num: jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jsc.nat(),
        normal   : jsc.nat(),
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const users = new UserGenerator(input)
        .all()
        .map((user) => Map(user));
      const sizeIsCorrect   = users.length === input.num;
      const allElemsAreUser = users.every((user) => user.has('email') && user.has('uuid') && user.has('userAgent') && user.has('ipAddress'));
      return sizeIsCorrect && allElemsAreUser;
    });
  });
});
