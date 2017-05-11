const jsc = require('jsverify');

const jscPosInteger = jsc.nat.smap((x) => x + 1   , (x) => x - 1   );
const jscNegInteger = jsc.nat.smap((x) => -(x + 1), (x) => -(x - 1));

module.exports = {
  jscNegInteger,
  jscPosInteger,
}
