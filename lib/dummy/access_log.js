const faker = require('faker');
const {
  Map,
  Range,
  Set
} = require('immutable');
const is     = require('is_js');
const moment = require('moment');

const {randomInt} = require('../random');
const RatioMap    = require('../ratio_map');
const {
  isNotDateRange,
  isNotInstanceOf,
} = require('../type');
const {
  CrudReqGenerator,
  ReqGenerator,
} = require('./req_generator');
const UserGenerator = require('./user_generator');

function dummyAccessLog({numOfLines, userGenerator, reqGenerators, dateRange}) {
  if (is.not.integer(numOfLines)) {
    throw new Error('1st argument{numOfLines} must be integer');
  }
  if (isNotInstanceOf(userGenerator, UserGenerator)) {
    throw new Error('1st argument{numOfUsers} must be UserGenerator');
  }
  if (is.not.existy(reqGenerators)) {
    reqGenerators = [];
  } else if (is.not.array(reqGenerators) || reqGenerators.some((r) => isNotInstanceOf(r, ReqGenerator))) {
    throw new Error('1st argument{reqGenerators} must be "undefined", "null" or [ReqGenerator, ...]');
  }
  if (is.not.existy(dateRange)) {
    dateRange = null;
  } else if (isNotDateRange(dateRange)) {
    throw new Error('1st argument{dateRange} must be "undefined", "null" or {start: Date, end: Date}');
  } else {
    dateRange = Map(dateRange).map((d) => moment(d))
    if (dateRange.get('start').isAfter(dateRange.get('end'))) {
      throw new Error('1st argument{dateRange: {start, end}} must satisfy start <= end');
    }
  }

  reqGenerators = reqGenerators.some((g) => g.resource === 'users') ? reqGenerators : (() => {
    const usersReqGenerator = new CrudReqGenerator({resource: 'users', methodRatio: {
      POST  : {ratio: 1, statusRatio: {201: 195, 400: 2, 403: 2, 500: 1}        },
      GET   : {ratio: 6, statusRatio: {200: 195, 401: 2, 403: 2, 500: 1}        },
      PUT   : {ratio: 2, statusRatio: {200: 194, 400: 2, 401: 2, 403: 2, 500: 1}},
      DELETE: {ratio: 1, statusRatio: {204: 195, 401: 2, 403: 2, 500: 1}        },
    }});
    return [usersReqGenerator, ...reqGenerators];
  })();
  const generatorRatio = new RatioMap(reqGenerators.reduce((map, reqGenerator) => map.set(reqGenerator, 1), Map()));

  const lines = Range(0, numOfLines)
    .map((_) => {
      const user         = Map(userGenerator.randomUser());
      const date         = dateRange ? faker.date.between(dateRange.get('start'), dateRange.get('end')) : faker.date.recent();
      const reqGenerator = generatorRatio.randomKey();
      const uuid         = (reqGenerator.resource === 'users' ? user.get('uuid') : null) || faker.random.uuid();
      const request      = reqGenerator.randomRequest(uuid);
      return Map(user)
        .delete('email') // Future: use Map.deleteAll()
        .delete('uuid')
        .merge({user: user.get('email'), timestamp: date.toISOString()})
        .merge(request)
        .toJSON();
    })
    .sort(({timestamp: a_t}, {timestamp: b_t}) => {
      if (a_t < b_t)      { return -1; }
      else if (a_t > b_t) { return 1;  }
      else                { return 0;  }
    });

  return lines.toJSON();
}

module.exports = {
  dummyAccessLog,
}
