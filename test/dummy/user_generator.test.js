const UserGenerator = require('../../lib/dummy/user_generator');

const {
  Map,
  fromJS
} = require('immutable');
const is  = require('is_js');
const jsc = require('jsverify');

const {
  TypeBasis,
  jscPosInteger,
} = require('../util');

describe('UserGenerator', () => {
  test('constructor() should throw Error', () => {
    const userParamBase = fromJS({
      num      : 1,
      typeRatio: {
        anonymous: 1,
        normal   : 1,
      },
    });

    const inputs = [
      ...(new TypeBasis()
        .withoutJson()
        .get()),

      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => userParamBase.set('num', v).toJS())),
      userParamBase.delete('num') .toJS(),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .add({premium: 1})
        .get()
        .map((v) => userParamBase.set('typeRatio', v).toJS())),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => userParamBase.setIn(['typeRatio', 'anonymous'], v).toJS())),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => userParamBase.setIn(['typeRatio', 'normal'], v).toJS())),
    ];

    for (const input of inputs) {
      expect(() => new UserGenerator(input)).toThrow();
    }
  });

  test('randomUser() should return some user', () => {
    const inputGenerator = jsc.oneof([
      jsc.record({
        num: jscPosInteger,
      }),
      jsc.record({
        num      : jscPosInteger,
        typeRatio: jsc.oneof([
          jsc.constant(undefined),
          jsc.constant(null),
          jsc.record({anonymous: jscPosInteger, normal: jsc.nat()}),
          jsc.record({anonymous: jsc.nat()    , normal: jsc.nat()}),
        ]),
      }),
    ]);
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      expect(user.has('email'    )).toBeTruthy();
      expect(user.has('uuid'     )).toBeTruthy();
      expect(user.has('userAgent')).toBeTruthy();
      expect(user.has('ipAddress')).toBeTruthy();

      return true;
    });
  });

  test('randomUser() should return some anonymous user', () => {
    const inputGenerator = jsc.record({
      num      : jscPosInteger,
      typeRatio: jsc.oneof([
        jsc.record({
          anonymous: jscPosInteger,
        }),
        jsc.record({
          anonymous: jscPosInteger,
          normal   : jsc.elements([undefined, null, 0]),
        }),
      ]),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      expect(user.get('email') === '-').toBeTruthy();
      expect(is.null(user.get('uuid'))).toBeTruthy();
      expect(user.has('userAgent')    ).toBeTruthy();
      expect(user.has('ipAddress')    ).toBeTruthy();

      return true;
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
      expect(users.length === input.num).toBeTruthy();
      for (const user of users) {
        expect(user.has('email'    )).toBeTruthy();
        expect(user.has('uuid'     )).toBeTruthy();
        expect(user.has('userAgent')).toBeTruthy();
        expect(user.has('ipAddress')).toBeTruthy();
      };

      return true;
    });
  });
});
