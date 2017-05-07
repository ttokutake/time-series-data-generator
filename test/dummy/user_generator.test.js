const UserGenerator = require('../../lib/dummy/user_generator');

const {
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
        .withoutJson()
        .add({premium: 1})
        .get()
        .map((v) => userParamBase.set('typeRatio', v).toJS())),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => userParamBase.setIn(['typeRatio', 'anonymous'], v).toJS())),

      ...(new TypeBasis()
        .withoutUndefined()
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
          jsc.record({
            anonymous: jsc.oneof([jsc.constant(undefined), jsc.nat()]),
            normal   : jsc.oneof([jsc.constant(undefined), jsc.nat()]),
          }),
        ]),
      }),
    ]);
    jsc.assertForall(inputGenerator, (input) => {
      const user = new UserGenerator(input).randomUser();
      expect(user).toHaveProperty('email'    );
      expect(user).toHaveProperty('uuid'     );
      expect(user).toHaveProperty('userAgent');
      expect(user).toHaveProperty('ipAddress');

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
          normal   : jsc.elements([undefined, 0]),
        }),
      ]),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = new UserGenerator(input).randomUser();
      expect(user).toHaveProperty('email', '-' );
      expect(user).toHaveProperty('uuid' , null);
      expect(user).toHaveProperty('userAgent');
      expect(user).toHaveProperty('ipAddress');

      return true;
    });
  });

  test('randomUser() should return null', () => {
    const input  = {num: 0};
    const output = new UserGenerator(input).randomUser();
    expect(output).toBeNull();
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
      const users = new UserGenerator(input).all();
      expect(users.length).toBe(input.num);
      for (const user of users) {
        expect(user).toHaveProperty('email'    );
        expect(user).toHaveProperty('uuid'     );
        expect(user).toHaveProperty('userAgent');
        expect(user).toHaveProperty('ipAddress');
      };

      return true;
    });
  });
});
