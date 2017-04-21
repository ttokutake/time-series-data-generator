function isNumber(v) {
  return typeof(v) === 'number';
}

function isNotNumber(v) {
  return !isNumber(v);
}

module.exports = {
  isNumber,
  isNotNumber,
};
