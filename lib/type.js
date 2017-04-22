const is = require('is_js');

function isPair(v) {
  return is.array(v) && v.length == 2;
}
function isNotPair(v) {
  return !isPair(v);
}

function isInstanceOf(v, cls) {
  return v instanceof cls;
}
function isNotInstanceOf(v, cls) {
  return !isInstanceOf(v, cls);
}

module.exports = {
  isInstanceOf,
  isNotInstanceOf,
  isPair,
  isNotPair,
};
