const faker      = require('faker');
const {Range}    = require('immutable');
const {validate} = require('jsonschema');

const {randomInt} = require('../random');
const RatioMap    = require('../ratio_map');

class UserGenerator {
  constructor(userParam) {
    UserGenerator.validate(userParam);
    const typeRatio = new RatioMap(userParam.typeRatio);
    this.users = Range(0, userParam.num)
      .map((_) => {
        const type = typeRatio.randomKey();
        var identities;
        switch (type) {
          case 'anonymous':
            identities = {email: '-', uuid: null};
            break;
          case 'normal':
          case null:
            identities = {email: faker.internet.email(), uuid: faker.random.uuid()};
            break;
          default:
            assert(false);
        }
        return Object.assign({userAgent: faker.internet.userAgent(), ipAddress: faker.internet.ip()}, identities);
      })
      .cacheResult();
  }

  randomUser() {
    return this.users.get(randomInt(0, this.users.size - 1)) || null;
  }

  all() {
    return this.users.toJSON();
  }

  static validate(userParam) {
    const schema = {
      $schema   : "http://json-schema.org/schema#",
      type      : 'object',
      properties: {
        num      : {type: 'integer', minimum: 0},
        typeRatio: {
          type      : 'object',
          properties: {
            anonymous: {type: 'integer', minimum: 0},
            normal   : {type: 'integer', minimum: 0},
          },
          additionalProperties: false,
        },
      },
      required: ['num'],
    };
    const result = validate(userParam, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    RatioMap.validate(userParam.typeRatio);
    return userParam;
  }
}

module.exports = UserGenerator;
