const {
  CrudReqGenerator,
  ReqGenerator,
} = require('../../lib/dummy/req_generator');

const escapeRegExp = require('escape-string-regexp');
const {
  List,
  Map,
} = require('immutable');
const jsc = require('jsverify');

const {
  jscPosInteger,
} = require('../util');


const statusRatio = {
  200: jscPosInteger,
  201: jscPosInteger,
  204: jscPosInteger,
  400: jscPosInteger,
  401: jscPosInteger,
  403: jscPosInteger,
  404: jscPosInteger,
  500: jscPosInteger,
};
const statusRatioGenerator = jsc.record(statusRatio);
const statusCandidates     = Map(statusRatio).keySeq().toList();

describe('ReqGenerator', () => {
  test('constructor() should throw Error', () => {
    const reqParamBase = Map({
      method     : 'HEAD',
      path       : '/index.html',
      ratio      : 1,
      statusRatio: {200: 1},
    });

    const inputs = [
      undefined,
      null,
      false,
      0,
      0.1,
      '',
      {},

      [undefined],
      [null     ],
      [false    ],
      [0        ],
      [0.1      ],
      [''       ],
      [[]       ],

      [reqParamBase.set('method', undefined).toJSON()],
      [reqParamBase.set('method', null     ).toJSON()],
      [reqParamBase.set('method', false    ).toJSON()],
      [reqParamBase.set('method', 0        ).toJSON()],
      [reqParamBase.set('method', 0.1      ).toJSON()],
      [reqParamBase.set('method', []       ).toJSON()],
      [reqParamBase.set('method', {}       ).toJSON()],
      [reqParamBase.delete('method')        .toJSON()],

      [reqParamBase.set('path', undefined).toJSON()],
      [reqParamBase.set('path', null     ).toJSON()],
      [reqParamBase.set('path', false    ).toJSON()],
      [reqParamBase.set('path', 0        ).toJSON()],
      [reqParamBase.set('path', 0.1      ).toJSON()],
      [reqParamBase.set('path', []       ).toJSON()],
      [reqParamBase.set('path', {}       ).toJSON()],
      [reqParamBase.delete('path')        .toJSON()],

      [reqParamBase.set('ratio', undefined).toJSON()],
      [reqParamBase.set('ratio', null     ).toJSON()],
      [reqParamBase.set('ratio', false    ).toJSON()],
      [reqParamBase.set('ratio', -1       ).toJSON()],
      [reqParamBase.set('ratio', 0.1      ).toJSON()],
      [reqParamBase.set('ratio', ''       ).toJSON()],
      [reqParamBase.set('ratio', []       ).toJSON()],
      [reqParamBase.set('ratio', {}       ).toJSON()],
      [reqParamBase.delete('ratio')        .toJSON()],

      [reqParamBase.set('statusRatio', undefined).toJSON()],
      [reqParamBase.set('statusRatio', null     ).toJSON()],
      [reqParamBase.set('statusRatio', false    ).toJSON()],
      [reqParamBase.set('statusRatio', 0        ).toJSON()],
      [reqParamBase.set('statusRatio', 0.1      ).toJSON()],
      [reqParamBase.set('statusRatio', ''       ).toJSON()],
      [reqParamBase.set('statusRatio', []       ).toJSON()],
      [reqParamBase.delete('statusRatio')        .toJSON()],
    ];

    for (const input of inputs) {
      expect(() => new ReqGenerator(input)).toThrow();
    }
  });

  test('randomRequest() should return some request', () => {
    const inputGenerator = jsc.nearray(jsc.record({
      method     : jsc.string,
      path       : jsc.string,
      ratio      : jscPosInteger,
      statusRatio: statusRatioGenerator,
    }));

    jsc.assertForall(inputGenerator, (input) => {
      const methodCandidates = input.map(({method}) => method)
      const pathCandidates   = input.map(({path}  ) => path  )
      const {method, path, status} = new ReqGenerator(input).randomRequest();
      expect(methodCandidates).toContain(method);
      expect(pathCandidates  ).toContain(path  );
      expect(statusCandidates).toContain(status);

      return true;
    });
  });

  test('randomRequest() should return default request', () => {
    const inputGenerator = jsc.array(jsc.record({
      method     : jsc.string,
      path       : jsc.string,
      ratio      : jsc.constant(0),
      statusRatio: statusRatioGenerator,
    }));

    jsc.assertForall(inputGenerator, (input) => {
      expect(new ReqGenerator(input).randomRequest()).toEqual(ReqGenerator.defaultRequest());

      return true;
    });
  });

  test('randomRequest() should return request with empty status', () => {
    const inputGenerator = jsc.nearray(jsc.record({
      method     : jsc.string,
      path       : jsc.string,
      ratio      : jscPosInteger,
      statusRatio: jsc.constant({}),
    }));

    jsc.assertForall(inputGenerator, (input) => {
      const methodCandidates = input.map(({method}) => method);
      const pathCandidates   = input.map(({path  }) => path  );
      const {method, path, status} = new ReqGenerator(input).randomRequest();
      expect(methodCandidates).toContain(method);
      expect(pathCandidates  ).toContain(path);
      expect(status          ).toBe('-');

      return true;
    });
  });
});

describe('CrudReqGenerator', () => {
  test('constructor() should throw Error', () => {
    const reqParamBase = Map({
      resource   : 'users',
      methodRatio: Map({
        POST  : Map({ratio: 1, statusRatio: {201: 1}}),
        GET   : Map({ratio: 1, statusRatio: {200: 1}}),
        PUT   : Map({ratio: 1, statusRatio: {200: 1}}),
        DELETE: Map({ratio: 1, statusRatio: {204: 1}}),
      }),
    });

    const inputs = [
      undefined,
      null,
      false,
      0,
      0.1,
      '',
      [],

      reqParamBase.set('resource', undefined).toJS(),
      reqParamBase.set('resource', null     ).toJS(),
      reqParamBase.set('resource', false    ).toJS(),
      reqParamBase.set('resource', 0        ).toJS(),
      reqParamBase.set('resource', 0.1      ).toJS(),
      reqParamBase.set('resource', []       ).toJS(),
      reqParamBase.set('resource', {}       ).toJS(),
      reqParamBase.delete('resource').toJS(),

      reqParamBase.set('methodRatio', undefined ).toJS(),
      reqParamBase.set('methodRatio', null      ).toJS(),
      reqParamBase.set('methodRatio', false     ).toJS(),
      reqParamBase.set('methodRatio', 0         ).toJS(),
      reqParamBase.set('methodRatio', 0.1       ).toJS(),
      reqParamBase.set('methodRatio', ''        ).toJS(),
      reqParamBase.set('methodRatio', []        ).toJS(),
      reqParamBase.set('methodRatio', {HEAD: {}}).toJS(),
      reqParamBase.delete('methodRatio').toJS(),

      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], -1       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], 0.1      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], -1       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], -1       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], -1       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], {}       ).toJS(),

      reqParamBase.deleteIn(['methodRatio', 'POST'  , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'GET'   , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'PUT'   , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'DELETE', 'ratio']).toJS(),

      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], 0.1      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], 0.1      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], 0.1      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], false    ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], 0.1      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], ''       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], []       ).toJS(),

      reqParamBase.deleteIn(['methodRatio', 'POST'  , 'statusRatio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'GET'   , 'statusRatio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'PUT'   , 'statusRatio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'DELETE', 'statusRatio']).toJS(),
    ];

    for (const input of inputs) {
      expect(() => new CrudReqGenerator(input)).toThrow();
    }
  });

  test('randomRequest() should return some crud request', () => {
    const inputGenerator = jsc.record({
      resource   : jsc.string,
      methodRatio: jsc.record({
        POST  : jsc.record({ratio: jscPosInteger, statusRatio: statusRatioGenerator}),
        GET   : jsc.record({ratio: jscPosInteger, statusRatio: statusRatioGenerator}),
        PUT   : jsc.record({ratio: jscPosInteger, statusRatio: statusRatioGenerator}),
        DELETE: jsc.record({ratio: jscPosInteger, statusRatio: statusRatioGenerator}),
      }),
    });

    jsc.assertForall(inputGenerator, jsc.string, (input, id) => {
      const pathRegExp       = new RegExp(`^/v1/${escapeRegExp(input.resource)}(/${escapeRegExp(id)})?`);
      const methodCandidates = ['POST', 'GET', 'PUT', 'DELETE'];
      const {method, path, status} = new CrudReqGenerator(input).randomRequest(id);
      expect(methodCandidates      ).toContain(method);
      expect(path.match(pathRegExp)).toBeTruthy();
      expect(statusCandidates      ).toContain(status);

      return true;
    });
  });

  test('randomRequest() should return default request', () => {
    const inputGenerator = jsc.record({
      resource   : jsc.string,
      methodRatio: jsc.oneof([
        jsc.constant({}),
        jsc.record({POST  : jsc.record({ratio: jsc.constant(0), statusRatio: statusRatioGenerator})}),
        jsc.record({GET   : jsc.record({ratio: jsc.constant(0), statusRatio: statusRatioGenerator})}),
        jsc.record({PUT   : jsc.record({ratio: jsc.constant(0), statusRatio: statusRatioGenerator})}),
        jsc.record({DELETE: jsc.record({ratio: jsc.constant(0), statusRatio: statusRatioGenerator})}),
      ]),
    });

    jsc.assertForall(inputGenerator, (input) => {
      expect(new CrudReqGenerator(input).randomRequest('id')).toEqual(CrudReqGenerator.defaultRequest());

      return true;
    });
  });

  test('randomRequest() should return crud request with empty status', () => {
    const inputs = [
      {resource: 'users', methodRatio: {POST  : {ratio: 1, statusRatio: {}}}},
      {resource: 'users', methodRatio: {GET   : {ratio: 1, statusRatio: {}}}},
      {resource: 'users', methodRatio: {PUT   : {ratio: 1, statusRatio: {}}}},
      {resource: 'users', methodRatio: {DELETE: {ratio: 1, statusRatio: {}}}},
    ];
    const expects = [
      {method: 'POST'  , path: '/v1/users'   , status: '-'},
      {method: 'GET'   , path: '/v1/users/id', status: '-'},
      {method: 'PUT'   , path: '/v1/users/id', status: '-'},
      {method: 'DELETE', path: '/v1/users/id', status: '-'},
    ];

    for (const [input, expected] of List(inputs).zip(expects).toJSON()) {
      expect(new CrudReqGenerator(input).randomRequest('id')).toEqual(expected);
    }
  });
});
