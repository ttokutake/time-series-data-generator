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

test('ReqGenerator.randomRequest() should return some CRUD request', () => {
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

test('ReqGenerator.randomRequest() should return default request', () => {
  const inputs = [
    [],
    [{method: 'HEAD', path: '/index.html', ratio: 0, statusRatio: {200: 1}}],
  ];

  for (const input of inputs) {
    expect(new ReqGenerator(input).randomRequest()).toEqual(ReqGenerator.defaultRequest());
  }
});

test('ReqGenerator.randomRequest() should return request with empty status', () => {
  const input = [{method: 'HEAD', path: '/index.html', ratio: 1, statusRatio: {}}];

  expect(new ReqGenerator(input).randomRequest()).toEqual({method: 'HEAD', path: '/index.html', status: '-'});
});
