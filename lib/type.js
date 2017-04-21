function isUndefined(v) {
  return typeof v === 'undefined';
}
function isNotUndefined(v) {
  return !isUndefined(v);
}

function isNull(v) {
  return v === null;
}
function isNotNull(v) {
  return !isNull(v);
}

function isNumber(v) {
  return typeof(v) === 'number';
}
function isNotNumber(v) {
  return !isNumber(v);
}

function isNotNaN(v) {
  return !isNaN(v);
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

function isPair(v) {
  return isArray(v) && v.length == 2;
}
function isNotPair(v) {
  return !isPair(v);
}

function isDate(v) {
  return v instanceof Date && isNotNaN(v.valueOf());
}
function isNotDate(v) {
  return !isDate(v);
}

module.exports = {
  isArray,
  isNotArray,
  isDate,
  isNotDate,
  isNull,
  isNotNull,
  isNumber,
  isNotNumber,
  isNotNaN,
  isPair,
  isNotPair,
  isString,
  isNotString,
  isUndefined,
  isNotUndefined,
};
