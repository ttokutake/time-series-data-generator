const UserGenerator = require('../../lib/dummy/user_generator');

const {
  Map,
} = require('immutable');
const is  = require('is_js');
const jsc = require('jsverify');

const {
  jscPosInteger,
  jscNegInteger,
} = require('../util');

describe('UserGenerator', () => {
  test('constructor() should throw Error', () => {
    const typeRatioBase = Map({
      anonymous: jsc.nat,
      normal   : jsc.nat,
    });
    const userParamBase = Map({
      num      : jsc.nat,
      typeRatio: jsc.record(typeRatioBase.toJSON()),
    });
    const valueGenerator = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorNum = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jscNegInteger,
      jsc.string,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorTypeRatio = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorTypeRatioAnonymous = jsc.oneof([
      jsc.constant(null),
      jsc.bool,
      jscNegInteger,
      jsc.string,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorTypeRatioNormal = valueGeneratorTypeRatioAnonymous;
    const inputGenerator = jsc.oneof([
      valueGenerator,

      jsc.record(userParamBase.set('num', valueGeneratorNum).toJSON()),
      jsc.record(userParamBase.delete('num')                .toJSON()),

      jsc.record(userParamBase.set('typeRatio', valueGeneratorTypeRatio).toJSON()),
      jsc.record(userParamBase.set('typeRatio', jsc.record(typeRatioBase.set('anonymous', valueGeneratorTypeRatioAnonymous).toJSON())).toJSON()),
      jsc.record(userParamBase.set('typeRatio', jsc.record(typeRatioBase.set('normal'   , valueGeneratorTypeRatioNormal   ).toJSON())).toJSON()),
      jsc.record(userParamBase.set('typeRatio', jsc.record(typeRatioBase.set('premium'  , jsc.json                        ).toJSON())).toJSON()),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => new UserGenerator(input)).toThrow();

      return true;
    });
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
            anonymous: jsc.oneof([jsc.constant(undefined), jsc.nat]),
            normal   : jsc.oneof([jsc.constant(undefined), jsc.nat]),
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
      num: jsc.nat,
      typeRatio: jsc.record({
        anonymous: jsc.nat,
        normal   : jsc.nat,
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
