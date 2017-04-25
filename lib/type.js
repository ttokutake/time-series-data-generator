const is = require('is_js');

function isInstanceOf(v, cls) {
  return v instanceof cls;
}
function isNotInstanceOf(v, cls) {
  return !isInstanceOf(v, cls);
}

function isDateRange(v) {
  return is.object(v) && is.date(v.start) && is.date(v.end);
}

function isNotDateRange(v) {
  return !isDateRange(v);
}

module.exports = {
  isDateRange,
  isNotDateRange,
  isInstanceOf,
  isNotInstanceOf,
};
