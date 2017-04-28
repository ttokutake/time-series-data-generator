const jsc = require('jsverify')

const jscPosInteger = jsc.nat.smap((x) => x + 1, (x) => x - 1);

module.exports = {
  jscPosInteger,
}
