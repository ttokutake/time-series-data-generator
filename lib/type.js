function isNumber(v) {
  return typeof(v) === 'number';
}
function isNotNumber(v) {
  return !isNumber(v);
}

function isString(v) {
  return typeof(v) === 'string';
}
function isNotString(v) {
  return !isString(v);
}

function isArray(v) {
  return Array.isArray(v);
}
function isNotArray(v) {
  return !isArray;
}

module.exports = {
  isArray,
  isNotArray,
  isNumber,
  isNotNumber,
  isString,
  isNotString,
};
