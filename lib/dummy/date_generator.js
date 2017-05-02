const faker      = require('faker');
const {Map}      = require('immutable');
const is         = require('is_js');
const {validate} = require('jsonschema');
const moment     = require('moment');

class DateGenerator {
  constructor(dateParam) {
    const param = DateGenerator.validate(dateParam);
    if (is.null(param)) {
      this.from     = null;
      this.until    = null;
      this.generate = faker.date.recent;
    } else {
      const {from, until} = param;
      this.from     = from;
      this.until    = until;
      this.generate = () => faker.date.between(this.from, this.until);
    }
  }

  randomDate() {
    return this.generate();
  }

  static validate(dateParam) {
    if (is.not.existy(dateParam)) {
      return null;
    }
    const param  = is.object(dateParam) && is.not.array(dateParam) ? Map(dateParam).map((v) => is.date(v) ? v.getTime() : v).toJSON() : dateParam;
    const schema = {
      $schema   : "http://json-schema.org/schema#",
      type      : 'object',
      properties: {
        from : {type: ['null', 'integer', 'string']},
        until: {type: ['null', 'integer', 'string']},
      },
      additionalProperties: false,
    };
    const result = validate(param, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    const now   = moment();
    const from  = is.existy(param.from ) ? moment(param.from ) : now;
    const until = is.existy(param.until) ? moment(param.until) : now;
    if (!from.isValid() || !until.isValid() || from.isAfter(until)) {
      throw new Error('param must be "undefined", "null" or {from: Date?, until: Date?} satisfying "from" <= "until" or "from" <= now <= "until"');
    }
    return {from: from.toISOString(), until: until.toISOString()};
  }
}

module.exports = DateGenerator;
