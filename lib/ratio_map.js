const {Map} = require('immutable');
const is    = require('is_js');

const {randomInt} = require('./random');

class RatioMap {
  constructor(map) {
    this.map = Map(map);

    if (this.map.some(is.not.integer)) {
      throw new Error('1st argument{k_1: v_1, ...} must satisfy any v_i is integer');
    }

    [this.ranges, this.max] = this.map
      .filter((v, k) => v > 0)
      .reduce(([map, sum], v, k) => {
        const upper = sum + v;
        return [map.set(k, [sum + 1, upper]), upper];
      }, [Map(), 0]);
  }

  randomKey() {
    const sample = randomInt(1, this.max);
    return this.ranges.findKey(([lower, upper]) => lower <= sample && sample <= upper) || null;
  }
}

module.exports = {RatioMap};
