const faker      = require('faker');
const is         = require('is_js');
const {validate} = require('jsonschema');
const moment     = require('moment');

class DateGenerator {
  constructor(dateParam) {
    DateGenerator.validate(dateParam);
    if (is.not.existy(dateParam)) {
      this.func  = faker.date.recent;
      this.start = null;
      this.end   = null;
    } else {
      this.func  = () => faker.date.between(this.start, this.end);
      this.start = dateParam.start;
      this.end   = dateParam.end;
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
        start: {type: 'object'},
        end  : {type: 'object'},
      },
      required: ['start', 'end'],
    };
    const result = validate(dateParam, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    if (is.not.date(dateParam.start) || is.not.date(dateParam) || moment(dateParam.start).isAfter(dateRange.end)) {
      throw new Error('param must be "undefined", "null" or {start: Date, end: Date} satisfying start <= end');
    }
    return dateParam;
  }
}

module.exports = DateGenerator;
