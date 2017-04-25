const faker = require('faker');
const {
  Map,
  Range,
  Set
} = require('immutable');
const is     = require('is_js');
const moment = require('moment');

const {randomInt} = require('../random');
const {RatioMap}  = require('../ratio_map');
const {
  isNotInstanceOf,
  isNotPair,
} = require('../type');
const {
  CrudReqGenerator,
  ReqGenerator,
} = require('./req_generator');

function dummyAccessLog({numOfLines, numOfUsers, reqGenerators, dateRange}) {
  if (is.not.integer(numOfLines)) {
    throw new Error('1st argument{numOfLines} must be integer');
  }
  if (is.not.integer(numOfUsers)) {
    throw new Error('1st argument{numOfUsers} must be integer');
  }
  if (is.not.existy(reqGenerators)) {
    reqGenerators = [];
  } else if (is.not.array(reqGenerators) || reqGenerators.some((r) => isNotInstanceOf(r, ReqGenerator))) {
    throw new Error('1st argument{reqGenerators} must be "undefined", "null" or [ReqGenerator, ...]');
  }
  if (is.not.existy(dateRange)) {
    dateRange = null;
  } else if (isNotPair(dateRange) || dateRange.some(is.not.date)) {
    throw new Error('1st argument{dateRange} must be "undefined", "null" or [Date, Date]');
  } else {
    dateRange = dateRange.map((d) => moment(d))
    if (dateRange[0].isAfter(dateRange[1])) {
      throw new Error('1st argument{dateRange: [date0, date1]} must satisfy date0 <= date1');
    }
  }

  const users = Range(0, numOfUsers)
    .map((_) => {
      return Map({
        email    : faker.internet.email(),
        userAgent: faker.internet.userAgent(),
        ipAddress: faker.internet.ip(),
        uuid     : faker.random.uuid(),
      });
    })
    .toList() // For fixing values of elements
    .toSeq();

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
      const user          = users.get(randomInt(0, numOfUsers - 1));
      const date          = dateRange ? faker.date.between(dateRange[0], dateRange[1]) : faker.date.recent();
      const reqGenerator  = generatorRatio.randomKey();
      const request       = reqGenerator.randomRequest(
        reqGenerator.resource === 'users' ?  user.get('uuid') : faker.random.uuid()
      );
      return user
        .delete('email') // Future: use Map.deleteAll()
        .delete('uuid')
        .merge({user: user.get('email'), timestamp: date.toISOString()})
        .merge(request);
    })
    .sort(({timestamp: a_t}, {timestamp: b_t}) => {
      if (a_t < b_t)      { return -1; }
      else if (a_t > b_t) { return 1;  }
      else                { return 0;  }
    });

  return lines.toJS();
}

module.exports = {
  dummyAccessLog,
}
