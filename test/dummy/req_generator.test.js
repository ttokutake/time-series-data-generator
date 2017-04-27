const {
  ReqGenerator,
} = require('../../lib/dummy/req_generator');

const {
  List,
  Map,
} = require('immutable');
const jsc   = require('jsverify');

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

    const reqGenerator = new ReqGenerator(input);
    const result       = reqGenerator.randomRequest();
    const method       = result.get('method');
    const path         = result.get('path');
    const status       = result.get('status');
    return methodCandidates.some((m) => m === method)
      && pathCandidates.some((p) => p === path)
      && statusCandidates.some((s) => s === status);
  });
});
