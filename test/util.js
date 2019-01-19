const jsc = require("jsverify");

const jscPosInteger = jsc.nat.smap(x => x + 1, x => x - 1);
const jscNonPosInteger = jsc.nat.smap(x => -x, x => -x);

module.exports = {
  jscPosInteger,
  jscNonPosInteger
};
