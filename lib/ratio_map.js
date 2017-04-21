const {Map} = require('immutable');

const {randomInt}   = require('./random');
const {isNotNumber} = require('./type');

class RatioMap {
  constructor(map) {
    this.map = Map(map);

    if (this.map.toList().some(isNotNumber)) {
      throw new Error('all values of 1st argument(map) must be "Number"');
    }

    [this.max, this.ranges] = this.map
      .filter((v, k) => v > 0)
      .reduce(([sum, map], v, k) => {
        const upper = sum + v;
        return [upper, map.set(k, [sum + 1, upper])];
      }, [0, Map()]);
  }

  randomKey() {
    const sample = randomInt(1, this.max);
    return this.ranges.findKey(([lower, upper]) => lower <= sample && sample <= upper);
  }
}

module.exports = {RatioMap};
