const faker      = require('faker');
const {Map}      = require('immutable');
const is         = require('is_js');
const {validate} = require('jsonschema');

const {RatioMap} = require('../ratio_map');

class ReqGenerator {
  constructor(reqParams) {
    const reqs = ReqGenerator.validate(reqParams)
      .map((p) => Map(p))
      .map((p) => p.update('statusRatio', (rs) => new RatioMap(rs)))
      .reduce((map, param) => map.set(param.delete('ratio'), param.get('ratio')), Map());
    this.reqRatio = new RatioMap(reqs);
  }

  randomRequest() {
    const req    = this.reqRatio.randomKey();
    const status = req.get('statusRatio').randomKey();
    return req.delete('statusRatio').set('status', status);
  }

  static validate(reqParams) {
    const schema = {
      type : 'array',
      items: {
        type      : 'object',
        properties: {
          method     : {type: 'string'},
          path       : {type: 'string'},
          ratio      : {type: 'integer', minimum: 1},
          statusRatio: {type: 'object'},
        },
        required: ['method', 'path', 'ratio', 'statusRatio'],
      },
    };
    const result = validate(reqParams, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    for (const {statusRatio} of reqParams) {
      RatioMap.validate(statusRatio);
    }
    return reqParams;
  }
}

class CrudReqGenerator extends ReqGenerator {
  constructor(crudParam) {
    CrudReqGenerator.validate(crudParam)

    const reqParams = Map(crudParam.methodRatio)
      .map(({ratio, statusRatio}, method) => {
        return {method: method, path: `/v1/${crudParam.resource}`, ratio, statusRatio};
      })
      .toList();
    super(reqParams.toJSON());

    this.resource = crudParam.resource;
  }

  randomRequest(id) {
    if (is.not.string(id)) {
      throw new Error('1st argument(id) must be "String"');
    }
    return super.randomRequest().update('path', (path) => `${path}/${id}`);
  }

  static validate(crudParam) {
    const schema = {
      type      : 'object',
      properties: {
        resource   : {type: 'string'},
        methodRatio: {
          type      : 'object',
          properties: {
            POST  : {'$ref': '#/definitions/reqRatio'},
            GET   : {'$ref': '#/definitions/reqRatio'},
            PUT   : {'$ref': '#/definitions/reqRatio'},
            DELETE: {'$ref': '#/definitions/reqRatio'},
          },
        },
      },
      required: ['resource', 'methodRatio'],
      definitions: {
        reqRatio: {
          type: 'object',
          properties: {
            ratio      : {type: 'integer', minimum: 1},
            statusRatio: {type: 'object'},
          },
          required: ['ratio', 'statusRatio'],
        },
      },
    };
    const result = validate(crudParam, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    Map(crudParam.methodRatio).forEach(({statusRatio}) => RatioMap.validate(statusRatio));
    return crudParam;
  }
}

module.exports = {
  CrudReqGenerator,
  ReqGenerator,
};
