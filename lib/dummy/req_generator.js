const faker = require('faker');
const {Map} = require('immutable');
const is    = require('is_js');

const {RatioMap} = require('../ratio_map');

class ReqGenerator {
  constructor(reqParams) {
    const reqs = reqParams
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
}

class CrudReqGenerator extends ReqGenerator {
  constructor(crudParam) {
    const reqParams = Map(crudParam.methodRatio)
      .map(({ratio, statusRatio}, method) => {
        return {method: method, path: `/v1/${crudParam.resource}`, ratio, statusRatio};
      })
      .toList();
    super(reqParams);

    this.resource = crudParam.resource;
  }

  randomRequest(id) {
    if (is.not.string(id)) {
      throw new Error('1st argument(id) must be "String"');
    }
    return super.randomRequest().update('path', (path) => `${path}/${id}`);
  }
}

module.exports = {
  CrudReqGenerator,
  ReqGenerator,
};
