const is  = require('is_js');
const jsc = require('jsverify');

class TypeBasis {
  constructor(values) {
    this.values = values || [
      undefined,
      null,
      false,
      -1,
      0,
      1,
      -0.1,
      0.1,
      '',
      [],
      {},
      () => {},
    ];
  }

  get() {
    return this.values;
  }

  inspect() {
    console.log(this.values);
    return this;
  }

  add(value) {
    return new TypeBasis([value, ...this.values]);
  }

  withoutUndefined() {
    return new TypeBasis(this.values.filter(is.not.undefined));
  }

  withoutNull() {
    return new TypeBasis(this.values.filter(is.not.null));
  }

  withoutBoolean() {
    return new TypeBasis(this.values.filter(is.not.boolean));
  }

  withoutNumber() {
    return new TypeBasis(this.values.filter(is.not.number));
  }

  withoutInteger() {
    return new TypeBasis(this.values.filter(is.not.integer));
  }

  withoutZero() {
    return new TypeBasis(this.values.filter((v) => is.not.integer(v) || v !== 0));
  }

  withoutPosInteger() {
    return new TypeBasis(this.values.filter((v) => is.not.integer(v) || v < 1));
  }

  withoutNegInteger() {
    return new TypeBasis(this.values.filter((v) => is.not.integer(v) || v > -1));
  }

  withoutString() {
    return new TypeBasis(this.values.filter(is.not.string));
  }

  withoutArray() {
    return new TypeBasis(this.values.filter(is.not.array));
  }

  withoutJson() {
    return new TypeBasis(this.values.filter(is.not.json));
  }

  withoutLamda() {
    return new TypeBasis(this.values.filter(is.not.function));
  }
}

const jscPosInteger = jsc.nat.smap((x) => x + 1, (x) => x - 1);

module.exports = {
  TypeBasis,
  jscPosInteger,
}
