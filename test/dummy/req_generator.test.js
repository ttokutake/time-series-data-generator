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
  TypeBasis,
  jscNegInteger,
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
      method     : jsc.string,
      path       : jsc.string,
      ratio      : jsc.nat,
      statusRatio: jsc.dict(jsc.nat),
    });
    const valueGenerator = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.nearray(jsc.oneof([
        jsc.constant(undefined),
        jsc.constant(null),
        jsc.bool,
        jsc.number,
        jsc.string,
        jsc.array(jsc.json),
        jsc.fn(jsc.json),
      ])),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorMethod = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorPath = valueGeneratorMethod;
    const valueGeneratorRatio = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jscNegInteger,
      jsc.string,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorStatusRatio = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.record({200: jscNegInteger}),
      jsc.fn(jsc.json),
    ]);
    const inputGenerator = jsc.oneof([
      valueGenerator,

      jsc.nearray(jsc.record(reqParamBase.set('method', valueGeneratorMethod).toJSON())),
      jsc.nearray(jsc.record(reqParamBase.delete('method')                   .toJSON())),

      jsc.nearray(jsc.record(reqParamBase.set('path', valueGeneratorPath).toJSON())),
      jsc.nearray(jsc.record(reqParamBase.delete('path')                 .toJSON())),

      jsc.nearray(jsc.record(reqParamBase.set('ratio', valueGeneratorRatio).toJSON())),
      jsc.nearray(jsc.record(reqParamBase.delete('ratio')                  .toJSON())),

      jsc.nearray(jsc.record(reqParamBase.set('statusRatio', valueGeneratorStatusRatio).toJSON())),
      jsc.nearray(jsc.record(reqParamBase.delete('statusRatio')                        .toJSON())),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => new ReqGenerator(input)).toThrow();

      return true;
    });
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
      const output = new ReqGenerator(input).randomRequest();
      expect(output).toEqual(ReqGenerator.defaultRequest());

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
      resource   : jsc.string,
      methodRatio: jsc.record({
        POST  : jsc.record({ratio: jsc.nat, statusRatio: jsc.dict(jsc.nat)}),
        GET   : jsc.record({ratio: jsc.nat, statusRatio: jsc.dict(jsc.nat)}),
        PUT   : jsc.record({ratio: jsc.nat, statusRatio: jsc.dict(jsc.nat)}),
        DELETE: jsc.record({ratio: jsc.nat, statusRatio: jsc.dict(jsc.nat)}),
      }),
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
    const valueGeneratorResource = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.array(jsc.json),
      jsc.dict(jsc.json),
      jsc.fn(jsc.json),
    ]);
    const valueGeneratorMethodRatio = jsc.oneof([
      jsc.constant(undefined),
      jsc.constant(null),
      jsc.bool,
      jsc.number,
      jsc.string,
      jsc.array(jsc.json),
      jsc.record({HEAD: jsc.json}),
      jsc.fn(jsc.json),
    ]);
    // Do not check contents of "methodRatio" because of test readability (and no warries)
    const inputGenerator = jsc.oneof([
      valueGenerator,

      jsc.record(reqParamBase.set('resource', valueGeneratorResource).toJSON()),
      jsc.record(reqParamBase.delete('resource')                     .toJSON()),

      jsc.record(reqParamBase.set('methodRatio', valueGeneratorMethodRatio).toJSON()),
      jsc.record(reqParamBase.delete('methodRatio')                        .toJSON()),
    ]);

    jsc.assertForall(inputGenerator, (input) => {
      expect(() => new CrudReqGenerator(input)).toThrow();

      return true;
    });
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
      const methodCandidates = ['POST', 'GET', 'PUT', 'DELETE'];
      const pathRegExp       = new RegExp(`^/v1/${escapeRegExp(input.resource)}(/${escapeRegExp(id)})?`);
      const {method, path, status} = new CrudReqGenerator(input).randomRequest(id);
      expect(methodCandidates).toContain(method);
      expect(path            ).toMatch(pathRegExp);
      expect(statusCandidates).toContain(status);

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
      const output = new CrudReqGenerator(input).randomRequest('id');
      expect(output).toEqual(CrudReqGenerator.defaultRequest());

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
      const output = new CrudReqGenerator(input).randomRequest('id');
      expect(output).toEqual(expected);
    }
  });
});
