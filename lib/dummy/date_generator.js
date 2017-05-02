const faker      = require('faker');
const is         = require('is_js');
const {validate} = require('jsonschema');
const moment     = require('moment');

class DateGenerator {
  constructor(dateParam) {
    DateGenerator.validate(dateParam);
    if (is.not.existy(dateParam)) {
      this.func  = faker.date.recent;
      this.from  = null;
      this.until = null;
    } else {
      this.func  = () => faker.date.between(this.from, this.until);
      this.from  = dateParam.from;
      this.until = dateParam.until;
    }
  }

  randomDate() {
    return this.func();
  }

  static validate(dateParam) {
    if (is.not.existy(dateParam)) {
      return dateParam;
    }
    const schema = {
      type      : 'object',
      properties: {
        from : {type: 'object'},
        until: {type: 'object'},
      },
      required: ['from', 'until'],
    };
    const result = validate(dateParam, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    if (is.not.date(dateParam.from) || is.not.date(dateParam.until) || moment(dateParam.from).isAfter(dateRange.until)) {
      throw new Error('param must be "undefined", "null" or {from: Date, until: Date} satisfying "from" <= "until"');
    }
    return dateParam;
  }
}

module.exports = DateGenerator;
