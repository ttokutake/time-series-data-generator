const {Map} = require('immutable');
const is    = require('is_js');

const {randomInt} = require('./random');

class Ratio {
  constructor(param) {
    this.map = Ratio.validate(param);

    [this.ranges, this.max] = this.map
      .filter((v) => v > 0)
      .reduce(([map, sum], v, k) => {
        const upper = sum + v;
        return [map.set(k, [sum + 1, upper]), upper];
      }, [Map(), 0]);
  }

  randomKey() {
    const sample = randomInt(1, this.max);
    const key    = this.ranges.findKey(([lower, upper]) => lower <= sample && sample <= upper);
    return is.existy(key) ? key : null;
  }

  static validate(param) {
    const map = Map(param).filter(is.not.undefined);
    if (map.some(is.not.integer)) {
      throw new Error('Map{k_1: v_1, ...} must satisfy any v_i is "integer"');
    }
    return map;
  }
}

module.exports = Ratio;
