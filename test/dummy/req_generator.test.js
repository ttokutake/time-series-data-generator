const {
  CrudReqGenerator,
  ReqGenerator,
} = require('../../lib/dummy/req_generator');

const {
  is: areEqual,
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

  const reqParamBase = Map({
    method     : 'HEAD',
    path       : '/index.html',
    ratio      : 1,
    statusRatio: {200: 1},
  });

  test('constructor() should throw Error', () => {
    const inputs = [
      undefined,
      null,
      0,
      '0',
      {},

      [undefined],
      [null     ],
      [0        ],
      ['0'      ],
      [[]       ],

      [reqParamBase.set('method', undefined).toJSON()],
      [reqParamBase.set('method', null     ).toJSON()],
      [reqParamBase.set('method', 0        ).toJSON()],
      [reqParamBase.set('method', []       ).toJSON()],
      [reqParamBase.set('method', {}       ).toJSON()],
      [reqParamBase.delete('method')        .toJSON()],

      [reqParamBase.set('path', undefined).toJSON()],
      [reqParamBase.set('path', null     ).toJSON()],
      [reqParamBase.set('path', 0        ).toJSON()],
      [reqParamBase.set('path', []       ).toJSON()],
      [reqParamBase.set('path', {}       ).toJSON()],
      [reqParamBase.delete('path')        .toJSON()],

      [reqParamBase.set('ratio', undefined).toJSON()],
      [reqParamBase.set('ratio', null     ).toJSON()],
      [reqParamBase.set('ratio', '0'      ).toJSON()],
      [reqParamBase.set('ratio', []       ).toJSON()],
      [reqParamBase.set('ratio', {}       ).toJSON()],
      [reqParamBase.delete('ratio')        .toJSON()],

      [reqParamBase.set('statusRatio', undefined).toJSON()],
      [reqParamBase.set('statusRatio', null     ).toJSON()],
      [reqParamBase.set('statusRatio', 0        ).toJSON()],
      [reqParamBase.set('statusRatio', '0'      ).toJSON()],
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
      const list = List(input);
      const methodCandidates = list.map(({method}) => method)
      const pathCandidates   = list.map(({path}  ) => path)

      const reqGenerator           = new ReqGenerator(input);
      const {method, path, status} = reqGenerator.randomRequest();
      return methodCandidates.some((m) => m === method)
        && pathCandidates.some((p) => p === path)
        && statusCandidates.some((s) => s === status);
    });
  });

  test('randomRequest() should return default request', () => {
    const inputs = [
      [],
      [reqParamBase.set('ratio', 0).toJSON()],
      [reqParamBase.set('ratio', 0).toJSON(), reqParamBase.set('ratio', 0).toJSON()],
    ];

    for (const input of inputs) {
      expect(new ReqGenerator(input).randomRequest()).toEqual(ReqGenerator.defaultRequest());
    }
  });

  test('randomRequest() should return request with empty status', () => {
    const input = [reqParamBase.set('statusRatio', {}).toJSON()];

    expect(new ReqGenerator(input).randomRequest()).toEqual({method: 'HEAD', path: '/index.html', status: '-'});
  });
});

describe('CrudReqGenerator', () => {

  const reqParamBase = Map({
    resource   : 'users',
    methodRatio: Map({
      POST  : Map({ratio: 1, statusRatio: {201: 1}}),
      GET   : Map({ratio: 1, statusRatio: {200: 1}}),
      PUT   : Map({ratio: 1, statusRatio: {200: 1}}),
      DELETE: Map({ratio: 1, statusRatio: {204: 1}}),
    }),
  });

  test('constructor() should throw Error', () => {
    const inputs = [
      undefined,
      null,
      0,
      '0',
      [],

      reqParamBase.set('resource', undefined).toJS(),
      reqParamBase.set('resource', null     ).toJS(),
      reqParamBase.set('resource', 0        ).toJS(),
      reqParamBase.set('resource', []       ).toJS(),
      reqParamBase.set('resource', {}       ).toJS(),
      reqParamBase.delete('resource').toJS(),

      reqParamBase.set('methodRatio', undefined ).toJS(),
      reqParamBase.set('methodRatio', null      ).toJS(),
      reqParamBase.set('methodRatio', 0         ).toJS(),
      reqParamBase.set('methodRatio', '0'       ).toJS(),
      reqParamBase.set('methodRatio', []        ).toJS(),
      reqParamBase.set('methodRatio', {HEAD: {}}).toJS(),
      reqParamBase.delete('methodRatio').toJS(),

      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'ratio'], {}       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], {}       ).toJS(),

      reqParamBase.deleteIn(['methodRatio', 'POST'  , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'GET'   , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'PUT'   , 'ratio']).toJS(),
      reqParamBase.deleteIn(['methodRatio', 'DELETE', 'ratio']).toJS(),

      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'POST'  , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'GET'   , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], '0'      ).toJS(),
      reqParamBase.setIn(['methodRatio', 'PUT'   , 'statusRatio'], []       ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], undefined).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], null     ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], 0        ).toJS(),
      reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], '0'      ).toJS(),
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
});
