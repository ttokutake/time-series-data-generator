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
      ...(new TypeBasis()
        .withoutArray()
        .get()),

      ...(new TypeBasis()
        .withoutJson()
        .get()
        .map((v) => [v])),

      ...(new TypeBasis()
        .withoutString()
        .get()
        .map((v) => reqParamBase.set('method', v).toJSON())),
      [reqParamBase.delete('method').toJSON()],

      ...(new TypeBasis()
        .withoutString()
        .get()
        .map((v) => reqParamBase.set('path', v).toJSON())),
      [reqParamBase.delete('path').toJSON()],

      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => reqParamBase.set('ratio', v).toJSON())),
      [reqParamBase.delete('ratio') .toJSON()],

      ...(new TypeBasis()
        .withoutJson()
        .add({200: -1})
        .get()
        .map((v) => reqParamBase.set('statusRatio', v).toJSON())),
      [reqParamBase.delete('statusRatio').toJSON()],
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
      resource   : 'users',
      methodRatio: Map({
        POST  : Map({ratio: 1, statusRatio: {201: 1}}),
        GET   : Map({ratio: 1, statusRatio: {200: 1}}),
        PUT   : Map({ratio: 1, statusRatio: {200: 1}}),
        DELETE: Map({ratio: 1, statusRatio: {204: 1}}),
      }),
    });

    const inputs = [
      ...(new TypeBasis()
        .withoutJson()
        .get()),

      ...(new TypeBasis()
        .withoutString()
        .get()
        .map((v) => reqParamBase.set('resource', v).toJS())),
      reqParamBase.delete('resource').toJS(),

      ...(new TypeBasis()
        .withoutJson()
        .add({HEAD: {ratio: 1, statusRatio: {201: 1}}})
        .get()
        .map((v) => reqParamBase.set('methodRatio', v).toJS())),
      reqParamBase.delete('methodRatio').toJS(),

      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'POST'], v).toJS())),
      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'GET'], v).toJS())),
      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'PUT'], v).toJS())),
      ...(new TypeBasis()
        .withoutUndefined()
        .withoutNull()
        .withoutJson()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'DELETE'], v).toJS())),

      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'POST', 'ratio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'POST', 'ratio']).toJS(),
      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'GET', 'ratio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'GET', 'ratio']).toJS(),
      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'PUT', 'ratio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'PUT', 'ratio']).toJS(),
      ...(new TypeBasis()
        .withoutZero()
        .withoutPosInteger()
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'DELETE', 'ratio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'DELETE', 'ratio']).toJS(),

      ...(new TypeBasis()
        .withoutJson()
        .add({200: -1})
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'POST', 'statusRatio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'POST', 'statusRatio']).toJS(),
      ...(new TypeBasis()
        .withoutJson()
        .add({200: -1})
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'GET', 'statusRatio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'GET', 'statusRatio']).toJS(),
      ...(new TypeBasis()
        .withoutJson()
        .add({200: -1})
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'PUT', 'statusRatio'], v).toJS())),
      reqParamBase.deleteIn(['methodRatio', 'PUT', 'statusRatio']).toJS(),
      ...(new TypeBasis()
        .withoutJson()
        .add({200: -1})
        .get()
        .map((v) => reqParamBase.setIn(['methodRatio', 'DELETE', 'statusRatio'], v).toJS())),
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
