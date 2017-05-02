function isInstanceOf(v, cls) {
  return v instanceof cls;
}
function isNotInstanceOf(v, cls) {
  return !isInstanceOf(v, cls);
}

module.exports = {
  isInstanceOf,
  isNotInstanceOf,
};
