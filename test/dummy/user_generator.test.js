const UserGenerator = require('../../lib/dummy/user_generator');

const {
  Map,
  fromJS
} = require('immutable');
const is  = require('is_js');
const jsc = require('jsverify');

const {
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
      undefined,
      null,
      false,
      0,
      0.1,
      '',
      [],

      userParamBase.set('num', undefined).toJS(),
      userParamBase.set('num', null     ).toJS(),
      userParamBase.set('num', false    ).toJS(),
      userParamBase.set('num', -1       ).toJS(),
      userParamBase.set('num', 0.1      ).toJS(),
      userParamBase.set('num', ''       ).toJS(),
      userParamBase.set('num', []       ).toJS(),
      userParamBase.set('num', {}       ).toJS(),
      userParamBase.delete('num')        .toJS(),

      userParamBase.set('typeRatio', false       ).toJS(),
      userParamBase.set('typeRatio', 0           ).toJS(),
      userParamBase.set('typeRatio', 0.1         ).toJS(),
      userParamBase.set('typeRatio', ''          ).toJS(),
      userParamBase.set('typeRatio', []          ).toJS(),
      userParamBase.set('typeRatio', {premium: 1}).toJS(),

      userParamBase.setIn(['typeRatio', 'anonymous'], false    ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], -1       ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], 0.1      ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], ''       ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], []       ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], {}       ).toJS(),

      userParamBase.setIn(['typeRatio', 'normal'], false    ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], -1       ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], 0.1      ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], ''       ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], []       ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], {}       ).toJS(),
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
