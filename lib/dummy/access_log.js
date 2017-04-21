const F                 = require('faker');
const {Map, Range, Set} = require('immutable');
const M                 = require('moment');

const {randomInt} = require('../random');
const {RatioMap}  = require('../ratio_map');
const {
  isNotArray,
  isNotDate,
  isNotNull,
  isNotNumber,
  isNotPair,
  isNotString,
  isNull,
  isUndefined,
} = require('../type');

function dummyAccessLog({numOfLines, numOfUsers, keysOfCrudReq, dateRange}) {
  if (isNotNumber(numOfLines)) {
    throw new Error('1st argument{numOfLines} must be "Number"');
  }
  if (isNotNumber(numOfUsers)) {
    throw new Error('1st argument{numOfUsers} must be "Number"');
  }
  if (isUndefined(keysOfCrudReq) || isNull(keysOfCrudReq)) {
    keysOfCrudReq = [];
  } else if (isNotArray(keysOfCrudReq) || keysOfCrudReq.some(isNotString)) {
    throw new Error('1st argument{keysOfCrudReq} must be "undefined", "null" or ["String", ...]');
  }
  if (isUndefined(dateRange) || isNull(dateRange)) {
    dateRange = null;
  } else if (isNotPair(dateRange) || dateRange.some(isNotDate)) {
    throw new Error('1st argument{dateRange} must be "undefined", "null" or [Date, Date]');
  }
  if (isNotNull(dateRange)) {
    dateRange = dateRange.map((d) => M(d))
    if (dateRange[0].isAfter(dateRange[1])) {
      throw new Error('1st argument{dateRange: [date0, date1]} must satisfy date0 <= date1');
    }
  }

  const users = Range(0, numOfUsers)
    .map((_) => {
      return {email: F.internet.email(), uuid: F.random.uuid()};
    })
    .toList() // For fixing values of elements
    .toSeq();

  const ratio    = Set(['users', ...keysOfCrudReq]).reduce((map, key) => map.set(key, 1), Map());
  const crudKeys = new RatioMap(ratio);

  const lines = Range(0, numOfLines)
    .map((_) => {
      const {email, uuid} = users.get(randomInt(0, numOfUsers - 1));
      const date          = dateRange ? F.date.between(dateRange[0], dateRange[1]) : F.date.recent();
      const key           = crudKeys.randomKey();
      const request       = getRandomCrudRequest(key, key === 'users' ? uuid : F.random.uuid());
      return Map({user: email, date: date.toISOString()}).merge(request);
    });

  return lines.toJSON();
}

function getRandomCrudRequest(key, id) {
  const path = `/v1/${key}`;

  const methods = new RatioMap({
    POST  : 1,
    GET   : 6,
    PUT   : 2,
    DELETE: 1,
  });
  switch (methods.randomKey()) {
    case 'POST':
      const statusesCreate = new RatioMap({
        201: 195,
        400: 2,
        403: 2,
        500: 1,
      });
      return {method: 'POST', path: path, status: statusesCreate.randomKey()};
    case 'GET':
      const statusesRetrieve = new RatioMap({
        200: 195,
        401: 2,
        403: 2,
        500: 1,
      });
      return {method: 'GET', path: `${path}/${id}`, status: statusesRetrieve.randomKey()};
    case 'PUT':
      const statusesUpdate = new RatioMap({
        200: 194,
        400: 2,
        401: 2,
        403: 2,
        500: 1,
      });
      return {method: 'PUT', path: `${path}/${id}`, status: statusesUpdate.randomKey()};
    case 'DELETE':
      const statusesDelete = new RatioMap({
        204: 195,
        401: 2,
        403: 2,
        500: 1,
      });
      return {method: 'DELETE', path: `${path}/${id}`, status: statusesDelete.randomKey()};
    default:
      assert(false);
  }
}

module.exports = {
  dummyAccessLog,
}
