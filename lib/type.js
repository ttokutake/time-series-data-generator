const is = require('is_js');

function isPair(v) {
  return is.array(v) && v.length == 2;
}
function isNotPair(v) {
  return !isPair(v);
}

module.exports = {
  isPair,
  isNotPair,
};
