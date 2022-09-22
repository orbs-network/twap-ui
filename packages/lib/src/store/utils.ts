import BN from "bn.js";

export const ceilDiv = (a?: BN, b?: BN) => {
  if (!a || !b) {
    return new BN(0);
  }
  if (a.isZero() || b.isZero()) {
    return new BN(0);
  }

  console.log(a.toString(), b.toString());

  return a
    .mul(new BN(10).pow(new BN(18)))
    .div(b)
    .add(new BN(10).pow(new BN(18)).sub(new BN(1)))
    .div(new BN(10).pow(new BN(18)));
};

export const notZeroNumber = (value?: number) => {
  return value === undefined ? false : Number(value) > 0;
};

export const isBigger = (a?: BN, b?: BN) => {
  if (!a || a.isZero()) {
    return false;
  }

  if (!b || b.isZero()) {
    return true;
  }
  return a.gt(b);
};
