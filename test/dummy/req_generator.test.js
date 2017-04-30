const {
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

      [reqParamBase.set('path', undefined).toJSON()],
      [reqParamBase.set('path', null     ).toJSON()],
      [reqParamBase.set('path', 0        ).toJSON()],
      [reqParamBase.set('path', []       ).toJSON()],
      [reqParamBase.set('path', {}       ).toJSON()],

      [reqParamBase.set('ratio', undefined).toJSON()],
      [reqParamBase.set('ratio', null     ).toJSON()],
      [reqParamBase.set('ratio', '0'      ).toJSON()],
      [reqParamBase.set('ratio', []       ).toJSON()],
      [reqParamBase.set('ratio', {}       ).toJSON()],

      [reqParamBase.set('statusRatio', undefined).toJSON()],
      [reqParamBase.set('statusRatio', null     ).toJSON()],
      [reqParamBase.set('statusRatio', 0        ).toJSON()],
      [reqParamBase.set('statusRatio', '0'      ).toJSON()],
      [reqParamBase.set('statusRatio', []       ).toJSON()],
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
